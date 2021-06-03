export const scaffoldConfigs = {
  web: {
    'typescript/standard': {
      label: 'Web 标准组件 - TypeScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'typescript/web/standard',
      meta: './meta.js',
      params: {
        name: {
          message: '三方包名称（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: '三方包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'javascript/standard': {
      label: 'Web 标准组件 - JavaScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'javascript/web/standard',
      meta: './meta.js',
      params: {
        name: {
          message: '三方包名称（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: '三方包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'typescript/monorepo': {
      label: 'Web Monorepo 仓库 - TypeScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'typescript/web/monorepo',
      meta: './meta.js',
      params: {
        name: {
          message: 'Monorepo 包名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: 'Monorepo 包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'javascript/monorepo': {
      label: 'Web Monorepo 仓库 - JavaScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'javascript/web/monorepo',
      meta: './meta.js',
      params: {
        name: {
          message: 'Monorepo 包名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: 'Monorepo 包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
  },
  node: {
    'typescript/standard': {
      label: 'Node 标准组件 - TypeScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'typescript/node/standard',
      meta: './meta.js',
      params: {
        name: {
          message: 'Node 包名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: 'Node 包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'javascript/standard': {
      label: 'Node 标准组件 - JavaScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'javascript/node/standard',
      meta: './meta.js',
      params: {
        name: {
          message: 'Node 包名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: 'Node 包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'typescript/monorepo': {
      label: 'Node Monorepo 仓库 - TypeScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'typescript/node/monorepo',
      meta: './meta.js',
      params: {
        name: {
          message: 'Node Monorepo 包名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: 'Node 包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'javascript/monorepo': {
      label: 'Node Monorepo 仓库 - JavaScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'javascript/node/monorepo',
      meta: './meta.js',
      params: {
        name: {
          message: 'Node Monorepo 包名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: 'Node 包描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
  },
  react: {
    'typescript/admin': {
      label: 'React Admin - TypeScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'typescript/react/admin',
      meta: './meta.js',
      params: {
        name: {
          message: '项目名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: '项目描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
    'javascript/admin': {
      label: 'React Admin - JavaScript',
      template: 'git@github.com:chnliquan/template.git',
      content: 'javascript/react/admin',
      meta: './meta.js',
      params: {
        name: {
          message: '项目名（英文）:',
          default: '<%= dirname %>',
        },
        description: {
          message: '项目描述:',
        },
        author: {
          message: '作者 (邮箱帐号):',
          default: '<%= author %>',
        },
      },
    },
  },
}
