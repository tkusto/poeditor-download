#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const minimist = require('minimist')
const POEditorClient = require('./lib/poeditor-client')

const argv = minimist(process.argv, {
  string: ['project-id', 'api-token', 'out', 'lang'],
  alias: {
    p: 'project-id',
    l: 'lang',
    o: 'out',
    t: 'api-token'
  }
})

if (!argv['api-token']) {
  console.error('POEditor API token is required (--api-token, -t)')
  process.exit(1)
}
if (!argv['project-id']) {
  console.error('Argument --project-id is required')
  process.exit(1)
}
if (!argv.lang) {
  console.error('Language(s) (--lang, -l) must be passed')
  process.exit(1)
}

const langs = Array.isArray(argv.lang) ? argv.lang : [argv.lang]
const client = new POEditorClient({
  apiToken: argv['api-token'],
  projectId: argv['project-id']
})

langs.forEach(async (lang) => {
  const data = await client.export(lang)
  const outPath = argv.out.replace('{{lng}}', lang)
  const absoluteOutPath = path.resolve(outPath)
  const dirPath = path.dirname(absoluteOutPath)
  await fs.mkdir(dirPath, { recursive: true })
  await fs.writeFile(absoluteOutPath, data)
})
