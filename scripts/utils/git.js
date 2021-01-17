const { exec } = require('./cp')

exports.getStatus = async () => {
  const status = await exec('git status --porcelain')
  return status
}

exports.getBranchName = async () => {
  const branch = await exec('git rev-parse --abbrev-ref HEAD')
  return branch.replace(/\n|\r|\t/, '')
}
