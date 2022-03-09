#! /usr/bin/env node

'use strict'

const chalk = require('chalk')
const leven = require('leven')
const { program } = require('commander')
const { logger, minimist } = require('@eljs/node-utils')

const pkg = require('../package.json')

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .usage('<command> [options]')

program
  .command('create <package-name>')
  .description('create a new project')
  .option('--config-path <config-path>', 'The config file path', '../lib/default-config.js')
  .option('--group <group>', 'Specify the template group')
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

    const { create } = require('../lib/create')
    create(name, options)
  })

// output help information on unknown commands
program.arguments('<command>').action(cmd => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
  process.exitCode = 1
})

program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${chalk.cyan(`scaffold <command> --help`)} for detailed usage of given command.`
  )
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function enhanceErrorMessages(methodName, log) {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }

    this.outputHelp()
    console.log(`  ` + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name)

  let suggestion

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
