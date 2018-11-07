import { basename, extname, resolve } from 'path'
import globby from 'globby'
import xfs from 'fs-extra'

import { spawn } from './util'

const imageDir = process.env.PARZIVAL_IMAGE_BASE || '/srv/bern'
const ptifDir = process.env.PARZIVAL_PTIF_BASE || '/var/www/iiif'

const convert = async () => {
  for (let base of ['HS V unkomprimiert', 'HS VV unkomprimiert']) {
    base = resolve(imageDir, base)
    for (const image of (await globby(['VV*.JPG', '*.tif'].map(p => resolve(base, p))))) {
      const ext = extname(image)
      const imageBase = basename(image, ext).toLowerCase()

      if (!imageBase.match(/^v{1,2}[0-9]{3}[rv]$/)) continue

      const ptif = resolve(ptifDir, `${imageBase}.ptif`)
      if (await xfs.pathExists(ptif)) continue

      spawn('vips', [
        'tiffsave',
        image, ptif,
        '--tile', '--pyramid',
        '--compression=jpeg',
        '--tile-width', '256', '--tile-height', '256'
      ])
    }
  }
}

convert()
