import { basename, extname, resolve } from 'path'
import cp from 'child_process'

import globby from 'globby'
import xfs from 'fs-extra'

import { cwd, encoding } from './util'

const imageDir = process.env.PARZIVAL_IMAGE_BASE || '/srv/bern'
const dziDir = process.env.PARZIVAL_PTIF_BASE || '/var/www/dzi'

const bases = []
for (const numbered of ['unbeziffert', 'beziffert']) {
  for (const manuscript of ['V', 'VV']) {
    bases.push(`HS ${manuscript} neu ${numbered}`)
  }
}

const convert = async () => {
  let processed = -1
  while (processed !== 0) {
    processed = 0
    for (let base of bases) {
      const numbered = !base.includes('unbeziffert')
      base = resolve(imageDir, base)
      const images = await globby(
        ['*.png', '*.PNG', '*.tif', '*.TIF'].map(p => resolve(base, p))
      )
      for (const image of images) {
        const ext = extname(image)
        const imageBase = basename(image, ext).toLowerCase()

        if (!imageBase.match(/^v{1,2}(vs)?[0-9]{3}[rv]$/)) continue

        const suffix = numbered ? '_num' : ''
        const dziBase = resolve(dziDir, `${imageBase}${suffix}`)
        const dzi = `${dziBase}.dzi`
        const dziTiles = `${dziBase}_files`

        if (await xfs.pathExists(dzi)) continue

        const result = cp.spawnSync(
          'vips', [ 'dzsave', image, dziBase ],
          { cwd, encoding, stdio: 'inherit' }
        )

        if (result.status !== 0) {
          await xfs.remove(dzi)
          await xfs.remove(dziTiles)
        } else {
          console.log(dzi)
        }
        processed += 1
      }
    }
  }
}

convert()
