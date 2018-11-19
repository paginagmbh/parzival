const base = 'https://assets.pagina-dh.de'
const dziTiles = `${base}/parzival/images`
const dziBase = (sigil, page) => `${dziTiles}/${sigil.toLowerCase()}-${page}`

const iiifBase = (sigil, page) => `/iiif/${sigil.toLowerCase()}${page}.ptif`

export default {
  methods: {
    dzi (sigil, page) {
      return `${dziBase(sigil, page)}.dzi`
    },

    thumb (sigil, page) {
      return `${iiifBase(sigil, page)}/full/300,/0/default.jpg`
    },

    iiif (sigil, page) {
      return `${iiifBase(sigil, page)}/info.json`
    }
  }
}
