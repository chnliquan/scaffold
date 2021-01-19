import { DistinctQuestion, Answers } from 'inquirer'

export interface DownloadOptions {
  label?: string
  basedir?: string
  content?: string
  version?: string
  branch?: string
  verbose?: boolean
  presets?: Record<string, unknown>
  meta?: string
  fields?: Record<string, unknown>[]
  stripBlankLines?: boolean

  transform?: (type: string, srcFile: string, destFile: string) => string | boolean
}

export interface ScaffoldConfig<T extends Answers = Answers> {
  ignoreExists?: boolean
  autoInstall?: boolean
  forceGit?: boolean
  meta?: string
  content?: string
  params?: {
    [key: string]: DistinctQuestion<T>
  }
  label: string
  template: string
  beforeInit?: AsyncGeneratorFunction
  afterInit?: AsyncGeneratorFunction
}

export interface PresetVars {
  author: string
  email: string
  gitUrl: string
  registry: string
  date: string
  dateTime: string
  dirname: string
}
