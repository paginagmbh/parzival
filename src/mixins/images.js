const base = 'https://assets.pagina-dh.de'
const dziTiles = `${base}/parzival/images`
const dziBase = (sigil, page) => `${dziTiles}/${sigil.toLowerCase()}-${page}`

export default {
  methods: {
    dzi (sigil, page) {
      return `${dziBase(sigil, page)}.dzi`
    },

    thumb (sigil, page) {
      return `${dziBase(sigil, page)}_files/8/0_0.jpeg`
    },

    iiif (sigil, page) {
      return `/iiif/${sigil.toLowerCase()}${page}.ptif/info.json`
    }
  }
}
