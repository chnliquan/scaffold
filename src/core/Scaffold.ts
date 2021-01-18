import fs from 'fs'
import assert from 'assert'
import { ListQuestion } from 'inquirer'
import {
  Choice,
  confirm,
  hasGit,
  hasProjectGit,
  hasYarn,
  logger,
  renderTemplate,
  select,
  spawn,
} from '@eljs/node-utils'
import { ScaffoldConfig } from '../types'

const fileWhiteList = ['.git', 'LICENSE']

export class Scaffold {
  public label: string
  public template: string
  public meta?: string
  public content?: string

  constructor(type: string, private context: string, private config: ScaffoldConfig) {
    assert(config.label, `Expect ${type} to define label but got undefined`)
    assert(config.template, `Expect ${type} to define template but got undefined`)

    this.label = config.label
    this.meta = config.meta
    this.content = config.content
    this.template = config.template
  }

  async getFields(presets: Record<string, any> = {}): Promise<Record<string, any>[]> {
    const fields = []
    const { params } = this.config

    for (const name in params) {
      const item = params[name]
      let defaultValue = null

      if (typeof item.default === 'boolean') {
        defaultValue = item.default
      } else {
        defaultValue = await renderTemplate(item.default || '', presets || {})
      }

      fields.push({
        name: name,
        message: item.message,
        type: item.type || 'input',
        choices: (item as ListQuestion).choices,
        when: item.when,
        default: defaultValue,
      })
    }

    return fields
  }

  async checkEmpty(dir: string): Promise<boolean> {
    const { ignoreExists, label } = this.config

    if (ignoreExists) {
      return true
    }

    const files = fs.readdirSync(dir).filter(file => {
      return !fileWhiteList.includes(file)
    })

    if (files.length) {
      logger.warn(`The following files exist in the current directory ${dir}:\n`)
      files.forEach(file => console.log(' - ' + file))
      console.log()
      return confirm(`Are you sure you want to initialize ${label} in this directory?`, true)
    }

    return true
  }

  shouldInitGit(): boolean {
    if (!hasGit()) {
      return false
    }

    // --git
    if (this.config.forceGit) {
      return true
    }

    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }

  async autoInstall(): Promise<void> {
    const { autoInstall } = this.config
    const installChoices: Choice[] = [
      {
        name: 'Yes, Use NPM',
        value: 'npm',
      },
    ]

    if (hasYarn()) {
      installChoices.unshift({
        name: 'Use Yarn',
        value: 'yarn',
      })
    }

    if (autoInstall) {
      const pkgManager = await select(
        'Pick the package manager to use when installing dependencies:',
        installChoices
      )
      this.installDeps(pkgManager)
      return
    }

    installChoices.push({
      name: 'No, I will handle it manually',
      value: 'no',
    })

    const install = await select('Should install the dependencies now?', installChoices)

    if (install === 'no') {
      return
    }

    await this.installDeps(install)
  }

  private async installDeps(pkgManager: string) {
    let args: string[] = []

    if (pkgManager === 'yarn') {
      args = []
    } else if (pkgManager === 'npm') {
      args = ['install']
    }

    try {
      logger.info('Downloading dependency package, please wait...')
      await spawn(pkgManager, args, {
        cwd: this.context,
        stdio: 'inherit',
      })
      logger.success('Dependencies download completely.')
    } catch (error) {
      logger.error(`Dependencies download failed, the reason is as follows\n: ${error}.`)
    }
  }
}
