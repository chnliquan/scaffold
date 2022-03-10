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
