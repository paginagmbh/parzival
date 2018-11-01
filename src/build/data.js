import 'coffeescript/register'

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
  const transcriptsDir = path('transcripts', 'conversion')

  spawn('tustep', [], {
    env: {
      ...process.env,
      TUSTEP_CMD: 'xmlexport',
      TUSTEP_INI: 'tustep.ini',
      TUSTEP_MEM: '00300000'
    },
    cwd: transcriptsDir
  })

  const sources = (await globby(resolve(transcriptsDir, '*.xml'))).map(source => {
    const base = basename(source, '_neu.xml')
    let [ , manuscript, index ] = base.match(/(v{1,2})n?p([0-9]+)/)
    manuscript = manuscript.toUpperCase()
    index = parseInt(index, 10)
    return { source, manuscript, index }
  })

  sources.sort((a, b) => a.manuscript.localeCompare(b.manuscript) || (a.index - b.index))

  xfs.outputJson(
    path('src', 'data', 'transcript.json'),
    await transcriptParser(sources),
    { spaces: 2 }
  )
}

metadata()
transcripts()
