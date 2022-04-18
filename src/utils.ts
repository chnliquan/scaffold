import path from 'path'
import fs from 'fs-extra'
import npa from 'npm-package-arg'
import isTextPath from 'is-text-path'
import {
  getNpmInfo,
  download,
  logger,
  run,
  renderTemplate,
  isDirectory,
  stripBlankLines,
  removeSync,
  normalizeRepo,
  spin,
  tmpdir,
  existsSync,
  confirm,
  safeWriteFileSync,
  loopAsk,
  ask,
  chalk,
  camelize,
  dasherize,
} from '@eljs/node-utils'
import { DownloadOptions } from './types'

function isCompiledFile(file: string) {
  const fileList = ['.npmrc', 'LICENSE']
  return isTextPath(file) || fileList.some(item => file.endsWith(item))
}

function render(content: string, data: Record<string, any> = {}) {
  return renderTemplate(content, data, {
    _with: false,
    context: data,
  })
}

function presetCamelize(str = '', bigCamelCase = false) {
  return camelize(str, bigCamelCase)
}

function presetDasherize(str = '') {
  return dasherize(str)
}

export async function downloadNpm(npm: string, version: string, tmpdir: string): Promise<string> {
  const parsed = npa(npm)
  const npmName = parsed.name || ''
  const npmSpec = parsed.rawSpec || version
  const npmInfo = await getNpmInfo(npmName, npmSpec)

  if (!npmInfo || !npmInfo.dist || !npmInfo.dist.tarball) {
    logger.error(`Failed to get template ${npm} npm package address`)
    process.exit(1)
  }

  await download(npmInfo.dist.tarball, tmpdir)
  return path.join(tmpdir, 'package')
}

export async function cloneGit(gitUrl: string, branch: string, tmpdir: string): Promise<string> {
  branch = branch || 'master'

  try {
    await run('git', ['clone', gitUrl, '-q', '-b', branch, '--depth', '1', 'package'], {
      cwd: tmpdir,
    })
  } catch (err) {
    logger.error(`Failed to download template repository ${gitUrl}，\n ${err}`)
    process.exit(1)
  }

  return path.join(tmpdir, 'package')
}

export async function downloadTemplate(
  template: string,
  tmpdir: string,
  options: Required<DownloadOptions>
): Promise<string> {
  if (/^(@\w+\/)[\w.-]+$/.test(template)) {
    return downloadNpm(template, options.version, tmpdir)
  } else {
    return cloneGit(template, options.branch, tmpdir)
  }
}

export async function writeTemplate(
  src: string,
  dest: string,
  params: Record<string, any>,
  options: DownloadOptions
): Promise<void> {
  options = options || Object.create(null)

  const { verbose, transform } = options
  const names = await fs.readdir(src)

  if (!fs.existsSync(dest)) {
    await fs.mkdirp(dest)
  }

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const srcFile = path.join(src, name)
    // modify dest file name
    let destFile = path.join(
      dest,
      await render(name, {
        ...params,
        extract,
        camelize: presetCamelize,
        dasherize: presetDasherize,
      })
    )
    // const matched = name.match(/{{(\w+)}}[\s\S]*\.(\w+)/)

    // if (matched && params[matched[1]]?.split('/').length > 1) {
    //   const pieces = params[matched[1]].split('/')

    //   destFile = path.join(dest, `${pieces[pieces.length - 1]}.${matched[2]}`)
    // }

    if (isDirectory(srcFile)) {
      if (!fs.existsSync(destFile)) {
        await fs.mkdir(destFile)

        if (verbose) {
          logger.info(` +${options.basedir ? path.relative(options.basedir, destFile) : destFile}`)
        }
      }
      await writeTemplate(srcFile, destFile, params, options)
    } else {
      const dirname = path.dirname(destFile)

      if (!fs.existsSync(dirname)) {
        await fs.mkdir(dirname)

        if (verbose) {
          logger.info(` +${options.basedir ? path.relative(options.basedir, destFile) : dirname}`)
        }
      }

      if (isCompiledFile(srcFile)) {
        let content = await fs.readFile(srcFile, 'utf8')
        content = await render(content, {
          ...params,
          extract,
          camelize: presetCamelize,
          dasherize: presetDasherize,
        })

        if (options.stripBlankLines) {
          content = stripBlankLines(content)
        }

        // transform file name
        if (typeof transform === 'function') {
          const transformed = transform('filename', srcFile, destFile)

          if (typeof transformed === 'string') {
            content = transformed
          } else if (transformed === false) {
            // will skip file if transform return false
            continue
          }
        }

        if (path.basename(destFile) === 'package.ejs') {
          destFile = destFile.replace(/\.ejs$/, '.json')
        }

        await fs.writeFile(destFile, content)
      } else {
        await fs.copyFile(srcFile, destFile)
      }

      if (verbose) {
        logger.info(` +${options.basedir ? path.relative(options.basedir, destFile) : destFile}`)
      }
    }
  }
}

function formatAnswers(fields: any[], answers: Record<string, any>) {
  const formattedAnswers = Object.create(null)
  let removes: string[] = []

  fields.forEach(field => {
    const answer = answers[field.name]

    if (field.type === 'checkbox' || field.type === 'list') {
      const choices = field.choices

      for (const choice of choices) {
        const selected = answer.includes(choice.value)
        // tools: ['dobux', 'swet'] => { dobux: true } { swet: false }
        formattedAnswers[choice.value.toLowerCase()] = selected

        if (!selected && choice.source) {
          removes = removes.concat(
            typeof choice.source === 'string' ? [choice.source] : choice.source
          )
        }
      }
    } else {
      // TODO: handle answer is true and delete opposite
      if (!answer && field.source) {
        removes = removes.concat(typeof field.source === 'string' ? [field.source] : field.source)
      }
    }
  })

  return {
    formattedAnswers: Object.assign(formattedAnswers, answers),
    removes,
  }
}

function convertFile(template: string, tmpDir: string, other = ''): string {
  const repo = normalizeRepo(template)
  const srcFile = `${repo.href}/${tmpDir.replace(/[\s\S]+package\//, '')}/${other}`

  return srcFile
}

export async function generateScaffold(
  basedir: string,
  template: string,
  options: DownloadOptions = Object.create(null)
): Promise<void> {
  const tmp = tmpdir(true)

  try {
    console.log()
    // 1. download template
    const templateDir = await spin(
      `Downloading template ${chalk.cyanBright.bold(options.label)}, This might take a while...`,
      downloadTemplate,
      {
        args: [template, tmp, options],
      }
    )
    console.log()

    process.on('exit', () => {
      removeSync(tmp)
    })

    let pkgDir = templateDir

    if (options.content) {
      pkgDir = path.join(templateDir, options.content)
    }

    if (!existsSync(pkgDir)) {
      console.log()
      logger.printErrorAndExit(
        `The template file ${convertFile(
          template,
          pkgDir
        )} does not exist, please check and try again.`
      )
    }

    const presets = options.presets || Object.create(null)
    const configFields = options.fields || []
    let totalAnswers = Object.create(null)
    let totalFields: Record<string, any>[] = configFields

    if (options.meta) {
      const metaFile = path.join(pkgDir, options.meta)

      if (!existsSync(metaFile)) {
        console.log()
        const isOk = await confirm(
          `The template configuration file ${convertFile(
            template,
            pkgDir,
            options.meta
          )} does not exist, whether to continue execution?`,
          true
        )

        if (!isOk) {
          process.exit(1)
        }
      } else {
        const meteContent = fs.readFileSync(metaFile, 'utf8')

        // meta data should compile
        if (meteContent.indexOf('<%') > -1) {
          const configAnswers = await ask(configFields, presets)

          const content = await render(meteContent, {
            ...presets,
            ...configAnswers,
            extract,
            camelize: presetCamelize,
            dasherize: presetDasherize,
          })

          safeWriteFileSync(metaFile, content)

          const metaDataFields = require(metaFile) || []
          const metaDataAnswers = await ask(metaDataFields)

          totalFields = configFields.concat(metaDataFields)
          totalAnswers = Object.assign(configAnswers, metaDataAnswers)
        } else {
          const metaDataFields = require(metaFile) || []

          totalFields = configFields.concat(metaDataFields)
          totalAnswers = (await loopAsk(totalFields, presets)) || Object.create(null)
        }
      }

      removeSync(metaFile)
    } else {
      totalAnswers = (await loopAsk(configFields, options.presets)) || Object.create(null)
    }

    const { formattedAnswers, removes } = formatAnswers(totalFields, totalAnswers)

    if (formattedAnswers?.name || formattedAnswers?.projectName) {
      formattedAnswers.shortName = (formattedAnswers.name || formattedAnswers.projectName).replace(
        /^@[\s\S]+\//,
        ''
      )
    }

    Object.assign(presets, formattedAnswers)

    // 2. write file
    await writeTemplate(pkgDir, basedir, presets, options)

    if (removes.length > 0) {
      removes.forEach(toRemove => removeSync(path.resolve(basedir, toRemove)))
    }
  } catch (err) {
    console.log()
    logger.printErrorAndExit(String(err))
  } finally {
    // 3. remove tmpdir
    removeSync(tmp)
  }
}

export function extract(str = '', reg = /^@\w+\/([\s\S]+)/): string {
  if (reg.test(str)) {
    return RegExp.$1
  } else {
    return str
  }
}
