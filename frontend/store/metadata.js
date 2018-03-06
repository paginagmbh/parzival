const { assign } = Object;
const { min, max } = Math;

const metadata = require("./metadata.json");

const quire = require("../../lib/quire");
const { pageSigil } = require("../../lib/manuscript");

const manuscripts = metadata.map(manuscript => assign(manuscript, {
    singlePages: manuscript.pages.map(p => [ p ]),
    doublePages: quire.doublePages(manuscript.pages)
}));

function findManuscript(sigil) {
    const [ first ] = manuscripts;
    return manuscripts.find(m => m.sigil == sigil) || first;
}

function findPages(pages, sigil="") {
    for (let pi = 0, pl = pages.length; pi < pl; pi++) {
        if (pages[pi].indexOf(sigil) >= 0) {
            return pi;
        }
    }
    return 0;
}

module.exports = {
    namespaced: true,

    getters: {
        manuscripts() {
            return metadata;
        },

        manuscript(state, getters, { route }) {
            const { params } = route;
            return findManuscript(params.sigil || "");
        },

        pages(state, { manuscript }, { route }) {
            const { params } = route;
            const { singlePages, doublePages } = manuscript;
            switch (params.mode || "") {
            case "double-page":
                return doublePages;
            default:
                return singlePages;
            }
        },

        index(state, { pages }, { route }) {
            const { params } = route;
            const { page } = params;
            return findPages(pages, page);
        },

        page(state, { pages, index }) {
            return pages[index];
        },

        tileSources(state, { manuscript, page }) {
            const { sigil } = manuscript;

            return page.map(page => page === undefined ? undefined : [
                "https://assets.pagina-dh.de/iiif",
                `/parzival-${sigil.toLowerCase()}-${page}.ptif`,
                "info.json"
            ].join("/"));
        },

        verses(state, { manuscript, page }) {
            const { columns } = manuscript;

            const pageColumns = columns.filter(c => page.indexOf(pageSigil(c)) >= 0);
            const a = pageColumns.shift();
            const b = pageColumns.pop() || a;

            return [a.start, b.end];
        }
    }
};