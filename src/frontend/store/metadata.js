const { min, max } = Math;
const metadata = require("../../metadata.json");

function validManuscript(sigil) {
    const [ first ] = metadata;
    return metadata.find(m => m.sigil == sigil) || first;
}

function pageIndex(pages, index) {
    return max(0, min(pages.length - 1, index));
}

module.exports = {
    namespaced: true,

    getters: {
        metadata() {
            return metadata;
        },

        manuscript(state, getters, rootState) {
            const { route } = rootState;
            const { name, params } = route;
            const { sigil } = params;
            return validManuscript(
                name == "facsimile" ? sigil : ""
            );
        },

        title(state, { manuscript }) {
            const { title } = manuscript;
            return title;
        },

        sigil(state, { manuscript }) {
            const { sigil } = manuscript;
            return sigil;
        },

        page(state, { manuscript }, { route }) {
            const { pages } = manuscript;
            const { name, params } = route;
            const { page } = params;
            return pages[pageIndex(pages, pages.indexOf(
                name == "facsimile" ? page : ""
            ))];
        },

        index(state, { manuscript, page }) {
            const { pages } = manuscript;
            return pages.indexOf(page);
        },

        prevPage(state, { manuscript, index }) {
            const { pages } = manuscript;
            return pages[pageIndex(pages, index - 1)];
        },

        noPrevPage(state, { page, prevPage }) {
            return page == prevPage;
        },

        nextPage(state, { manuscript, index }) {
            const { pages } = manuscript;
            return pages[pageIndex(pages, index + 1)];
        },

        noNextPage(state, { page, nextPage }) {
            return page == nextPage;
        },

        id(state, { sigil, page }) {
            return [sigil.toLowerCase(), page].join("-");
        },

        tileSources(state, { id }) {
            return [`https://assets.pagina-dh.de/iiif/parzival-${id}.ptif/info.json`];
        }
    }
};