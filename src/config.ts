export const scaffoldConfigs = {
  github: {
    web: {
      standard: {
        label: 'Web 标准组件',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'web/github/standard',
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
      monorepo: {
        label: 'Web Monorepo 仓库',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'web/github/monorepo',
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
      standard: {
        label: 'Node 标准组件',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'node/github/standard',
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
      monorepo: {
        label: 'Node Monorepo 仓库',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'node/github/monorepo',
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
  },
  gitlab: {
    web: {
      standard: {
        label: 'Web 标准组件',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'web/gitlab/standard',
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
      monorepo: {
        label: 'Web Monorepo 仓库',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'web/gitlab/standard',
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
      standard: {
        label: 'Node 标准组件',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'node/gitlab/standard',
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
      monorepo: {
        label: 'Node Monorepo 仓库',
        template: 'git@github.com:chnliquan/typescript-template.git',
        content: 'node/gitlab/monorepo',
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
  },
}
