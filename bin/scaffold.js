#! /usr/bin/env node

'use strict'

const { Command } = require('commander')
const { logger, minimist } = require('@eljs/node-utils')
const pkg = require('../package.json')

const program = new Command()

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .usage('<command> [options]')

program
  .command('init <package-name>')
  .description('create a new project')
  .option('--type <type>', 'Specify the template repo type, github or gitlab')
  .option('--group <group>', 'Specify the template repo type group')
  .option('--dest <destination>', 'The location where the project is generated')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('-i, --install', 'Automatically install dependencies after downloading')
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      logger.info(
        `You provided more than one argument. The first one will be used as the app's name, the rest are ignored.`
      )
    }

    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    const { init } = require('../lib/init')
    init(name, options)
  })

program.parse(process.argv)
