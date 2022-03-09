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
  chalk,
  camelize,
  dasherize,
} from '@eljs/node-utils'
import { DownloadOptions } from './types'

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
      await renderTemplate(name, {
        ...params,
        extract,
        camelize,
        dasherize,
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
          logger.info(' +', options.basedir ? path.relative(options.basedir, destFile) : destFile)
        }
      }
      await writeTemplate(srcFile, destFile, params, options)
    } else {
      const dirname = path.dirname(destFile)

      if (!fs.existsSync(dirname)) {
        await fs.mkdir(dirname)

        if (verbose) {
          logger.info(' +', options.basedir ? path.relative(options.basedir, destFile) : dirname)
        }
      }

      // only copy text file
      if (isTextPath(srcFile)) {
        let content = await fs.readFile(srcFile, 'utf8')
        content = await renderTemplate(content, {
          ...params,
          extract,
          camelize,
          dasherize,
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
        logger.info(' +', options.basedir ? path.relative(options.basedir, destFile) : destFile)
      }
    }
  }
}

function processAnswers(dest: string, fields: any[], passedParams: Record<string, any>): void {
  const removeSource = (sourceFile?: string | string[]): void => {
    if (sourceFile) {
      if (typeof sourceFile === 'string') {
        sourceFile = [sourceFile]
      }

      sourceFile.forEach(source => {
        removeSync(path.join(dest, source))
      })
    }
  }

  fields.forEach(field => {
    const answer = passedParams[field.name]

    if (field.type === 'checkbox' || field.type === 'list') {
      const choices = field.choices

      for (const choice of choices) {
        const selected = answer.includes(choice.value)
        // tools: ['dobux', 'swet'] => { dobux: true } { swet: false }
        passedParams[choice.name.toLowerCase()] = selected

        if (selected) {
          continue
        }

        removeSource(choice.source)
      }
    } else {
      if (answer) {
        return false
      }

      removeSource(field.source)
    }
  })
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
    let fields = options.fields || []

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
        const content = await renderTemplate(fs.readFileSync(metaFile, 'utf8'), {
          ...presets,
          extract,
          camelize,
          dasherize,
        })

        safeWriteFileSync(metaFile, content)

        const metaData = require(metaFile) || []
        fields = fields.concat(metaData)
      }

      removeSync(metaFile)
    }

    const passedParams = (await loopAsk(fields, options.presets)) || Object.create(null)

    processAnswers(pkgDir, fields, passedParams)
    Object.assign(presets, passedParams)

    // 2. write file
    await writeTemplate(pkgDir, basedir, presets, options)
  } catch (err) {
    console.log()
    logger.printErrorAndExit(String(err))
  } finally {
    // 3. remove tmpdir
    removeSync(tmp)
  }
}

export function extract(str: string, reg = /^@\w+\/([\s\S]+)/): string {
  if (reg.test(str)) {
    return RegExp.$1
  } else {
    return str
  }
}
