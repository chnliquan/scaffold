import path from 'path'
import { existsSync, mkdirSync, select, chalk, run, logger } from '@eljs/node-utils'
import { ScaffoldManager } from './core/ScaffoldManager'
import { scaffoldConfigs } from './config'

export interface InitOptions {
  platform?: 'github' | 'gitlab'
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

  for (const groupKey of Object.keys(scaffoldConfigs)) {
    const config = (scaffoldConfigs as any)[groupKey]

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

  let platform = options.platform

  if (!platform) {
    platform = await select('Please select platform:', [
      {
        name: 'github',
        value: 'github',
      },
      {
        name: 'gitlab',
        value: 'gitlab',
      },
    ])
  }

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
    'Please select an initial template:',
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
    await run('git init', {
      cwd: targetDir,
    })
  }

  scaffold.content = `${platform}/${scaffold.content}`

  await scaffoldManager.generate(scaffold)

  logger.success(`🎉  Created project ${chalk.yellow(projectName)} successfully.`)
}
