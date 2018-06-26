const base = "https://assets.pagina-dh.de";
const dziTiles = `${base}/parzival/images`;

function dziBase(sigil, page) {
    return `${dziTiles}/${sigil.toLowerCase()}-${page}`;
}

module.exports = {
    dzi(sigil, page) {
        return `${dziBase(sigil, page)}.dzi`;
    },

    thumb(sigil, page) {
        return `${dziBase(sigil, page)}_files/8/0_0.jpeg`;
    }
};