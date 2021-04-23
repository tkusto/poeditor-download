#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const minimist = require('minimist')
const POEditorClient = require('./lib/poeditor-client')

const argv = minimist(process.argv, {
  string: ['project-id', 'api-token', 'out', 'lang'],
  boolean: ['split-by-context'],
  alias: {
    p: 'project-id',
    l: 'lang',
    o: 'out',
    t: 'api-token',
    C: 'split-by-context'
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

console.log(JSON.stringify(argv, null, 2))

const langs = Array.isArray(argv.lang) ? argv.lang : [argv.lang]
const client = new POEditorClient({
  apiToken: argv['api-token'],
  projectId: argv['project-id']
})

langs.forEach(async (lang) => {
  const data = await client.export(lang)
  if (argv['split-by-context']) {
    await writeContexts(lang, data)
  } else {
    await writeLang(lang, data)
  }
})

async function writeLang(lang, data) {
  const outPath = argv.out.replace('{{lng}}', lang)
  const absOutPath = path.resolve(outPath)
  const dirPath = path.dirname(absOutPath)
  await fs.mkdir(dirPath, { recursive: true })
  await fs.writeFile(absOutPath, data)
}

async function writeContexts(lang, data) {
  const jsonData = JSON.parse(data)
  const contexts = Object.keys(jsonData).filter(ctx => typeof jsonData[ctx] === 'object')
  await Promise.all(contexts.map(async ctx => {
    const outPath = argv.out
      .replace('{{ctx}}', ctx)
      .replace('{{lng}}', lang)
    const absOutPath = path.resolve(outPath)
    const dirPath = path.dirname(absOutPath)
    await fs.mkdir(dirPath, { recursive: true })
    await fs.writeFile(absOutPath, JSON.stringify(jsonData[ctx]))
  }))
}
