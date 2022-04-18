# scaffold

lightweight scaffolding tool

## Install

```bash
$ npm i @eljs/scaffold -g
```

```bash
$ yarn global @eljs/scaffold
```

## Usage

```bash
Usage: scaffold <command> [options]

Options:
  -v, --version                  output the current version
  -h, --help                     display help for command

Commands:
  create [options] <package-name>  create a new project
```

## Commands

### `scaffold create`

```bash
Usage: scaffold create [options] <package-name>

create a project based on the configuration

Options:
  --config-path <config-path>  The config file path (default: "../dist/default-config.js")
  --group <group>              Specify the template group
  --dest <destination>         The location where the project is generated
  -f, --force                  Overwrite target directory if it exists
  -i, --install                Automatically install dependencies after downloading
  -h, --help                   display help for command
```

## Presets

- `locals.author`：git config user email prefix
- `locals.email`：git config user email
- `locals.gitUrl`：git ssh url
- `locals.gitHref`：git website url
- `locals.registry`：npm registry
- `locals.year`：year corresponding to the current time
- `locals.date`：current time, YYYY-MM-DD
- `locals.datetime`：current time with time, YYYY-MM-DD hh:mm:ss
- `locals.dirname`：directory name
- `locals.shortName`: package name without prefix, `@eljs/scaffold` => `scaffold`
