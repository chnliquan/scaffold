import path from 'path'
import { existsSync, mkdirSync, select, chalk, run, logger } from '@eljs/node-utils'
import { ScaffoldManager } from './core/ScaffoldManager'
import { scaffoldConfigs } from './config'

export interface InitOptions {
  type?: 'github' | 'gitlab'
  group?: string
  dest?: string
  force?: boolean
  install?: boolean
  forceGit?: boolean
}

export async function init(projectName: string, options: InitOptions): Promise<void> {
  const { dest = process.cwd(), force = false, install = false, forceGit } = options
  const targetDir = path.join(dest, projectName)

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir)
  }

  logger.info(`Creating project in ${chalk.yellow(targetDir)}.`)

  const scaffoldManager = new ScaffoldManager(targetDir)

  let type = options.type!

  if (!type) {
    type = await select('Please select the repo type:', [
      {
        name: 'Github',
        value: 'github',
      },
      {
        name: 'Gitlab',
        value: 'gitlab',
      },
    ])
  }

  const groups = scaffoldConfigs[type]

  for (const groupKey of Object.keys(groups)) {
    const config = (groups as any)[groupKey]

    for (const name of Object.keys(config)) {
      scaffoldManager.addScaffold(`${groupKey}/${name}`, {
        ...config[name],
        autoInstall: install,
        ignoreExists: force,
        forceGit,
      })
    }
  }

  const initGroups: any = scaffoldManager.getGroups()

  let group: any = options.group

  if (!group) {
    group = await select(
      'Please select initial group:',
      Object.keys(initGroups).map(group => ({
        name: initGroups[group],
        value: group,
      }))
    )
  }

  const scaffolds = scaffoldManager.getScaffolds(group)
  const name = await select(
    'Please select an initial template',
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
    logger.info(`Initializing git repository...`)
    await run('git init')
  }

  await scaffoldManager.generate(scaffold)

  logger.success(`🎉  Created project ${chalk.yellow(projectName)} successfully.`)
}
