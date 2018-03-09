const { assign } = Object;

const metadata = require("./metadata.json");

const quire = require("../../lib/quire");
const { parsePageSigil, pageSigil } = require("../../lib/manuscript");

const manuscripts = metadata.map(manuscript => assign(manuscript, {
    singlePages: manuscript.pages.map(p => [ p ]),
    doublePages: quire.leafs(manuscript.pages.map(parsePageSigil)).map(
        leaf => leaf.map(p => p ? pageSigil(p) : undefined)
    )
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

        pageMode(state, getters, { route }) {
            const { params } = route;
            return params.mode || "single-page";
        },

        pages(state, { manuscript, pageMode }) {
            const { singlePages, doublePages } = manuscript;
            switch (pageMode) {
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

        quireIcon(state, { manuscript, page, pageMode }) {
            const { quires } = manuscript;
            const [ icons ] = page.filter(p => p).map(p => quires[p]);
            if (!icons) {
                return undefined;
            }
            const { singlePage, doublePage } = icons;
            switch (pageMode) {
            case "double-page":
                return doublePage;
            default:
                return singlePage;
            }
        },

        quireIconPath(state, { quireIcon }) {
            return quireIcon ? `/quire-icons/${quireIcon}.gif` : quireIcon;
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