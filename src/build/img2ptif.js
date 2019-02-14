import { basename, extname, resolve } from 'path'
import cp from 'child_process'

import globby from 'globby'
import xfs from 'fs-extra'

import { cwd, encoding } from './util'

const imageDir = process.env.PARZIVAL_IMAGE_BASE || '/srv/bern'
const ptifDir = process.env.PARZIVAL_PTIF_BASE || '/var/www/iiif/neu'

const convert = async () => {
  for (let base of ['HS V neu unbeziffert', 'HS VV neu unbeziffert']) {
    base = resolve(imageDir, base)
    for (const image of (await globby(['*.tif', '*.TIF'].map(p => resolve(base, p))))) {
      const ext = extname(image)
      const imageBase = basename(image, ext).toLowerCase()

      if (!imageBase.match(/^v{1,2}[0-9]{3}[rv]$/)) continue

      const ptif = resolve(ptifDir, `${imageBase}.ptif`)
      if (await xfs.pathExists(ptif)) continue

      const result = cp.spawnSync('vips', [
        'tiffsave',
        image, ptif,
        '--tile', '--pyramid',
        '--compression=jpeg',
        '--tile-width', '256', '--tile-height', '256'
      ], { cwd, encoding, stdio: 'inherit' })

      if (result.status !== 0) {
        await xfs.remove(ptif)
      } else {
        console.log(ptif)
      }
    }
  }
}

convert()
