const base = 'https://assets.pagina-dh.de'
const dziTiles = `${base}/parzival/images`
const dziBase = (sigil, page) => `${dziTiles}/${sigil.toLowerCase()}-${page}`

const iiifBase = (sigil, page, numbered) =>
  `/iiif/${sigil.toLowerCase()}${page}${numbered ? '_num' : ''}.ptif`

export default {
  methods: {
    dzi (sigil, page) {
      return `${dziBase(sigil, page)}.dzi`
    },

    thumb (sigil, page, numbered = false) {
      return `${iiifBase(sigil, page, numbered)}/full/300,/0/default.jpg`
    },

    iiif (sigil, page, numbered = false) {
      return `${iiifBase(sigil, page, numbered)}/info.json`
    }
  }
}
