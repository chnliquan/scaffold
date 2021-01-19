# scaffold

Lightweight scaffolding tool

## Install

```bash
$ npm i scaffold -g
```

```bash
$ yarn global scaffold
```

## Usage

```bash
Usage: scaffold <command> [options]

Options:
  -v, --version                  output the current version
  -h, --help                     display help for command

Commands:
  init [options] <package-name>  create a new project
```

## Commands 

### `scaffold init`

```bash
Usage: scaffold init [options] <package-name>

create a new project

Options:
  --template-group <template-group>  Specify the template group
  --dest <destination>               The location where the project is generated
  -f, --force                        Overwrite target directory if it exists
  -i, --install                      Automatically install dependencies after downloading
  -h, --help                         display help for command
```
