const { min, max } = Math;

const metadata = require("../../metadata.json");
const verse = require("../../verse");
const { pageSigil } = require("../../manuscript");

function manuscript(sigil) {
    const [ first ] = metadata;
    return metadata.find(m => m.sigil == sigil) || first;
}

function page(pages, index) {
    return max(0, min(pages.length - 1, index));
}

module.exports = {
    namespaced: true,

    getters: {
        manuscripts() {
            return metadata;
        },

        manuscript(state, getters, { route }) {
            const { params } = route;
            return manuscript(params.sigil || "");
        },

        page(state, { manuscript }, { route }) {
            const { pages } = manuscript;
            const { params } = route;

            const index = pages.indexOf(params.page || "");
            return pages[page(pages, index)];
        },

        index(state, { manuscript, page }) {
            const { pages } = manuscript;
            return pages.indexOf(page);
        },

        prevPage(state, { manuscript, index }) {
            const { pages } = manuscript;
            return pages[page(pages, index - 1)];
        },

        nextPage(state, { manuscript, index }) {
            const { pages } = manuscript;
            return pages[page(pages, index + 1)];
        },

        tileSources(state, { manuscript, page }) {
            const { sigil } = manuscript;
            const id = [sigil.toLowerCase(), page].join("-");
            return [`https://assets.pagina-dh.de/iiif/parzival-${id}.ptif/info.json`];
        },

        verses(state, { manuscript, page }) {
            const { columns } = manuscript;

            const pageColumns = columns.filter(c => pageSigil(c) == page);
            const a = pageColumns.shift();
            const b = pageColumns.pop() || a;

            return [a.start, b.end];
        }
    }
};