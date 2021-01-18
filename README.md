# scaffold

Lightweight scaffolding tool

## Install

```bash
$ npm i scaffold -g
```

```bash
$ yarn global scaffold
```

## Options

### --type?: 'github' | 'gitlab'

repo type of package

### --group?: string

repo group of package

### --dest?: string

the location where the project is generated, default `process.cwd()`

### -f | --force?: boolean

overwrite target directory if it exists

### -i | --install?: boolean

automatically install dependencies after downloading
