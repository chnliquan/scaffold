import path from 'path'
import { execSync } from 'child_process'
import moment from 'moment'
import { getGitUrl, getUserAccount, isDirectory, logger } from '@eljs/node-utils'
import { Scaffold } from './Scaffold'
import { generateScaffold } from '../utils'

import { ScaffoldConfig, DownloadOptions } from '../types'

const INIT_GROUPS = {
  web: 'Web Package',
  node: 'Node Package',
  react: 'React Application',
  vue: 'Vue Application',
  plugin: 'Eljs Plugin',
}

export type GroupKeys = keyof typeof INIT_GROUPS

interface ScaffoldMap {
  [key: string]: Scaffold
}

export class ScaffoldManager {
  private scaffolds: Record<GroupKeys, ScaffoldMap>

  constructor(private targetDir = process.cwd()) {
    if (!isDirectory(targetDir)) {
      logger.error(
        `The execution path ${targetDir} is not a folder, please initialize the project in the folder.`
      )
      process.exit(1)
    }

    this.scaffolds = Object.create(null)

    for (const group in INIT_GROUPS) {
      this.scaffolds[group as GroupKeys] = Object.create(null)
    }
  }

  addScaffold(type: string, scaffold: ScaffoldConfig): Scaffold | false {
    const pieces = type.split('/')
    const group = pieces.shift() as GroupKeys
    const name = pieces.join('/')

    if (!(group in INIT_GROUPS)) {
      logger.error(
        `The current scaffolding group ${group} is not supported, the current type is: ${type}.`
      )
      return false
    }

    this.scaffolds[group][name] = new Scaffold(type, this.targetDir, scaffold)
    return this.scaffolds[group][name]
  }

  getScaffolds(group: GroupKeys): ScaffoldMap {
    return this.scaffolds[group] || {}
  }

  getScaffold(type: string): Scaffold | undefined {
    const pieces = type.split('/')
    const group = pieces.shift() as GroupKeys
    const name = pieces.join('/')

    if (this.scaffolds[group] && this.scaffolds[group][name]) {
      return this.scaffolds[group][name]
    }
  }

  getGroups(): Partial<typeof INIT_GROUPS> {
    const exists = Object.keys(this.scaffolds).filter(group => {
      return Object.keys(this.scaffolds[group as GroupKeys]).length > 0
    })
    const groups = Object.create(null)

    exists.forEach(group => {
      groups[group] = INIT_GROUPS[group as GroupKeys]
    })

    return groups
  }

  getPresetVars(dir: string): Record<string, any> {
    const { name, email } = getUserAccount()
    const gitUrl = getGitUrl(dir)
    const registry =
      execSync('npm config get registry').toString().trim() || 'https://registry.npmjs.org'
    const date = moment().format('YYYY-MM-DD')
    const dateTime = moment().format('YYYY-MM-DD hh:mm:ss')
    const dirname = path.basename(dir)

    return {
      author: name,
      email,
      gitUrl,
      registry,
      date,
      dateTime,
      dirname,
    }
  }

  async generate(
    scaffold: Scaffold,
    options: DownloadOptions = Object.create(null)
  ): Promise<void> {
    const presets = this.getPresetVars(this.targetDir)
    const fields = await scaffold.getFields(presets)

    await generateScaffold(this.targetDir, scaffold.template, {
      ...options,
      presets,
      fields,
      label: scaffold.label,
      meta: scaffold.meta,
      content: scaffold.content,
    })

    await scaffold.autoInstall()
  }
}
