export default {
  web: {
    label: 'Web Application',
    templates: [
      {
        name: 'monorepo',
        label: 'Web Monorepo Template',
        template: 'git@github.com:chnliquan/monorepo-template.git',
        content: 'web',
        meta: './meta.js',
        params: {
          name: {
            message: 'Please enter the project name:',
            default: '<%= dirname %>',
          },
          description: {
            message: 'Please enter the description of this project:',
          },
          author: {
            message: 'Please enter the author of this project:',
            default: '<%= author %>',
          },
        },
      },
      {
        name: 'polyrepo',
        label: 'Web Polyrepo Template',
        template: 'git@github.com:chnliquan/polyrepo-template.git',
        content: 'web',
        meta: './meta.js',
        params: {
          name: {
            message: 'Please enter the project name:',
            default: '<%= dirname %>',
          },
          description: {
            message: 'Please enter the description of this project:',
          },
          author: {
            message: 'Please enter the author of this project:',
            default: '<%= author %>',
          },
        },
      },
    ],
  },
  node: {
    label: 'Node Application',
    templates: [
      {
        name: 'monorepo',
        label: 'Node Monorepo Template',
        template: 'git@github.com:chnliquan/monorepo-template.git',
        content: 'node',
        meta: './meta.js',
        params: {
          name: {
            message: 'Please enter the project name:',
            default: '<%= dirname %>',
          },
          description: {
            message: 'Please enter the description of this project:',
          },
          author: {
            message: 'Please enter the author of this project:',
            default: '<%= author %>',
          },
        },
      },
      {
        name: 'polyrepo',
        label: 'Node Polyrepo Template',
        template: 'git@github.com:chnliquan/polyrepo-template.git',
        content: 'node',
        meta: './meta.js',
        params: {
          name: {
            message: 'Please enter the project name:',
            default: '<%= dirname %>',
          },
          description: {
            message: 'Please enter the description of this project:',
          },
          author: {
            message: 'Please enter the author of this project:',
            default: '<%= author %>',
          },
          cli: {
            type: 'confirm',
            message: 'Will this project provide command line tools?:',
            default: true,
            source: 'bin/',
          },
        },
      },
    ],
  },
}
