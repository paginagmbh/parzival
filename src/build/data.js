import 'coffeescript/register.js'

import { basename, resolve } from 'path'
import globby from 'globby'
import xfs from 'fs-extra'

import { path, spawn } from './util'
import metadataParser from './metadata-parser.coffee'
import transcriptParser from './transcript-parser.coffee'

const metadata = async () => xfs.outputJson(
  path('src', 'data', 'metadata.json'),
  await metadataParser(),
  { spaces: 2 }
)

const transcripts = async () => {
  const transcriptsDir = path('src', 'tustep')
  const xmlFiles = () => globby(resolve(transcriptsDir, '*.xml'))

  for (const xf of (await xmlFiles())) {
    await xfs.remove(xf)
  }

  spawn('tustep', [], {
    env: {
      ...process.env,
      TUSTEP_CMD: 'xmlexport',
      TUSTEP_INI: 'tustep.ini',
      TUSTEP_MEM: '00300000'
    },
    cwd: transcriptsDir
  })

  const sources = (await xmlFiles()).map(source => {
    const manuscript = basename(source, '_rp.xml').toUpperCase()
    return { source, manuscript }
  })

  sources.sort((a, b) => a.manuscript.localeCompare(b.manuscript))

  xfs.outputJson(
    path('src', 'data', 'transcript.json'),
    await transcriptParser(sources),
    { spaces: 2 }
  )
}

metadata()
transcripts()
