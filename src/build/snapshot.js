const crc32 = require('crc/lib/crc32')
const fs = require('fs-extra')
const globby = require('globby')
const path = require('path')

const compareSnapshots = function compareSnapshots (from, to) {
  const allKeys = Array.from(new Set([
    ...Object.keys(from).sort(),
    ...Object.keys(to).sort()
  ]))

  for (const key of allKeys) {
    if (JSON.stringify(from[key]) !== JSON.stringify(to[key])) {
      return key
    }
  }

  return false
}

const snapshot = async function snapshot ({ globbyOptions, ignore, rootDir }) {
  const snapshot = {}

  const files = await globby('**', {
    ...globbyOptions,
    ignore,
    cwd: rootDir,
    absolute: true
  })

  await Promise.all(files.map(async (p) => {
    const key = path.relative(rootDir, p)
    try {
      const fileContent = await fs.readFile(p)
      snapshot[key] = {
        checksum: await crc32(fileContent).toString(16)
      }
    } catch (e) {
      // TODO: Check for other errors like permission denied
      snapshot[key] = {
        exists: false
      }
    }
  }))

  return snapshot
}

module.exports = {
  snapshot,
  compareSnapshots
}
