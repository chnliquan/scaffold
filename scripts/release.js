const path = require('path')
const chalk = require('chalk')
const newGithubReleaseUrl = require('new-github-release-url')
const open = require('open')

const generateChangelog = require('./changelog')
const getNextVersion = require('./getNextVersion')
const { isPrerelease, isAlphaVersion, isBetaVersion, isRcVersion } = require('./utils/version')
const logger = require('./utils/logger')
const { exec } = require('./utils/cp')
const { getStatus, getBranchName } = require('./utils/git')

const pkgPath = path.join(__dirname, '../package.json')
const { name } = require(pkgPath)

/**
 * Workflow
 *
 * 1. Make changes
 * 2. Commit those changes
 * 3. Make sure Travis turns green
 * 4. Bump version in package.json
 * 5. conventionalChangelog
 * 6. Commit package.json and CHANGELOG.md files
 * 7. Tag
 * 8. Push
 */
async function release() {
  const hasModified = await getStatus()

  if (hasModified) {
    logger.printErrorAndExit('Your git status is not clean. Aborting.')
  }

  const userRegistry = await exec('npm config get registry')

  if (!userRegistry.includes('https://npm.corp.kuaishou.com/')) {
    const registry = chalk.blue('https://npm.corp.kuaishou.com/')
    logger.printErrorAndExit(`Release failed, npm registry must be ${registry}.`)
  }

  logger.step(`bump version`)
  const nextVersion = await getNextVersion(pkgPath)

  logger.step(`generate changelog`)
  await generateChangelog()

  const commitMessage = `release: v${nextVersion}`

  logger.step(`git commit with ${commitMessage}`)
  await exec('git add .')
  await exec(`git commit -m '${commitMessage}'`)

  const tag = `v${nextVersion}`

  logger.step(`git tag ${tag}`)
  await exec(`git tag ${tag}`)

  const branch = await getBranchName()
  logger.step(`git push --set-upstream origin ${branch} --tags`)
  await exec(`git push --set-upstream origin ${branch} --tags`)

  logger.step(`publish package ${name}`)
  await publishToNpm(nextVersion)

  logger.step('create github release')
  await githubRelease(`${tag}`, changelog, isPrerelease(nextVersion))

  logger.success(`${name}@${nextVersion} 发布完成\n`)
}

async function publishToNpm(nextVersion) {
  const cliArgs = isRcVersion(nextVersion)
    ? 'publish --tag next'
    : isAlphaVersion(nextVersion)
    ? 'publish --tag alpha'
    : isBetaVersion(nextVersion)
    ? 'publish --tag beta'
    : 'publish'
  await exec(`npm ${cliArgs}`)
}

async function githubRelease(tag, body, isPrerelease) {
  const repoUrl = repository ? repository.url : 'https://github.com/kwai-efe/dobux'
  const url = newGithubReleaseUrl({
    repoUrl,
    tag,
    body,
    isPrerelease,
  })

  await open(url)
}

release()
