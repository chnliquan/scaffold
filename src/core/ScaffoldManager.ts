import path from 'path'
import { execSync } from 'child_process'
import moment from 'moment'
import {
  camelize,
  getGitUrl,
  normalizeRepo,
  getUserAccount,
  isDirectory,
  logger,
} from '@eljs/node-utils'
import { Scaffold } from './Scaffold'
import { generateScaffold } from '../utils'

import { ScaffoldConfig, DownloadOptions, ScaffoldConfigs } from '../types'

interface Scaffolds {
  [key: string]: Scaffold
}

export class ScaffoldManager {
  private _scaffolds: Record<string, Scaffolds>
  private _groups: Record<string, string> = Object.create(null)

  constructor(private readonly targetDir = process.cwd(), configs: ScaffoldConfigs) {
    if (!isDirectory(targetDir)) {
      logger.error(
        `The execution path ${targetDir} is not a folder, please initialize the project in the folder.`
      )
      process.exit(1)
    }

    this._scaffolds = Object.create(null)

    for (const group of Object.keys(configs)) {
      this._scaffolds[group] = Object.create(null)
      this._groups[group] = configs[group].label || camelize(group)
    }
  }

  get groups(): Record<string, string> {
    return this._groups
  }

  addScaffold(type: string, scaffold: ScaffoldConfig): Scaffold | false {
    const pieces = type.split('/')
    const group = pieces.shift() as string
    const name = pieces.join('/')

    if (!(group in this.groups)) {
      logger.error(
        `The current scaffolding group ${group} is not supported, the current type is: ${type}.`
      )
      return false
    }

    this._scaffolds[group][name] = new Scaffold(type, this.targetDir, scaffold)
    return this._scaffolds[group][name]
  }

  getScaffolds(group: string): Scaffolds {
    return this._scaffolds[group] || {}
  }

  getScaffold(type: string): Scaffold | undefined {
    const pieces = type.split('/')
    const group = pieces.shift() as string
    const name = pieces.join('/')

    if (this._scaffolds[group] && this._scaffolds[group][name]) {
      return this._scaffolds[group][name]
    }
  }

  getPresetVars(dir: string): Record<string, any> {
    const { name, email } = getUserAccount()
    const gitUrl = getGitUrl(dir)
    const { href: gitHref = '' } = normalizeRepo(gitUrl)
    const date = moment().format('YYYY-MM-DD')
    const dateTime = moment().format('YYYY-MM-DD hh:mm:ss')
    const dirname = path.basename(dir)

    let registry: string

    if (gitHref.includes('github.com')) {
      registry = 'https://registry.npmjs.org'
    } else {
      registry =
        execSync('npm config get registry').toString().trim() || 'https://registry.npmjs.org'
    }

    return {
      author: name,
      email,
      gitUrl,
      gitHref,
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
