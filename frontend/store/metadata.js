const { assign } = Object;

const metadata = require("./metadata.json");

const quire = require("../../lib/quire");
const { parsePageSigil, pageSigil } = require("../../lib/manuscript");
const verse = require("../../lib/verse");

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

        manuscript(state, getters, { manuscript }) {
            return findManuscript(manuscript);
        },

        pages(state, { manuscript }, { mode }) {
            const { singlePages, doublePages } = manuscript;
            switch (mode) {
            case "double-page":
                return doublePages;
            default:
                return singlePages;
            }
        },

        index(state, { pages }, { page }) {
            return findPages(pages, page);
        },

        prevPage(state, { index, pages }) {
            const prev = index - 1;
            return (prev < 0) ? undefined : pages[prev].filter(p => p).shift();
        },

        nextPage(state, { index, pages }) {
            const { length } = pages;

            const next = index + 1;
            return (next >= length) ? undefined : pages[next].filter(p => p).shift();
        },

        page(state, { pages, index }) {
            return pages[index];
        },

        pageTitle(state, { page }) {
            page = page.filter(p => p).map(p => p.replace(/^0+/, ""));
            return `Bl. ${page.join(", ")}`;
        },

        verses(state, { manuscript, page }) {
            const { columns } = manuscript;

            const pageColumns = columns.filter(c => page.indexOf(pageSigil(c)) >= 0);
            const a = pageColumns.shift();
            const b = pageColumns.pop() || a;

            return [a.start, b.end];
        },

        verseTitle(state, { verses }) {
            const [start, end] = verses;
            const [startType, endType] = [start, end].map(verse.type);

            return [
                startType, verse.toString(start),
                "–",
                startType == endType ? "" : endType, verse.toString(end)
            ].filter(c => c).join(" ");

        }
    }
};