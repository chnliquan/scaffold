import path from 'path'
import { existsSync, mkdirSync, select, chalk, run, logger } from '@eljs/node-utils'
import { ScaffoldManager } from './core/ScaffoldManager'
import { DownloadOptions, ScaffoldConfigs } from './types'

export interface CreateOptions {
  configs: ScaffoldConfigs
  presets?: DownloadOptions['presets']
  group?: string
  dest?: string
  force?: boolean
  install?: boolean
  forceGit?: boolean
}

export async function create(projectName: string, options: CreateOptions): Promise<void> {
  const {
    dest = process.cwd(),
    force = false,
    install = false,
    forceGit,
    configs,
    presets,
  } = options
  const targetDir = path.join(dest, projectName)

  // TODO: support template with no group

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir)
  }

  console.log()
  logger.info(`Creating project in ${chalk.yellow(targetDir)}.`)

  const scaffoldManager = new ScaffoldManager(targetDir, configs)

  for (const groupKey of Object.keys(configs)) {
    const { templates } = configs[groupKey]

    for (const template of templates) {
      scaffoldManager.addScaffold(`${groupKey}/${template.name}`, {
        ...template,
        autoInstall: install,
        ignoreExists: force,
        forceGit,
      })
    }
  }

  let group = options.group as string

  if (!group || !Object.keys(configs).includes(group)) {
    console.log()
    group = await select(
      'Please select an initialization template group:',
      Object.keys(scaffoldManager.groups).map(group => ({
        name: scaffoldManager.groups[group],
        value: group,
      }))
    )
  }

  const scaffolds = scaffoldManager.getScaffolds(group)

  console.log()
  const name = await select(
    'Please select an initialization template:',
    Object.keys(scaffolds).map(key => ({
      name: scaffolds[key].label,
      value: key,
    }))
  )

  const scaffold = scaffoldManager.getScaffold(`${group}/${name}`)

  if (!scaffold || !(await scaffold.checkEmpty(targetDir))) {
    return
  }

  const shouldInitGit = scaffold.shouldInitGit()

  if (shouldInitGit) {
    console.log()
    logger.info(`Initializing git repository...`)
    await run('git', ['init'], {
      cwd: targetDir,
    })
  }

  await scaffoldManager.generate(scaffold, {
    presets,
  })

  console.log()
  logger.done(`🎉  Created project ${chalk.green.bold(projectName)} successfully.`)
}
