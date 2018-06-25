const { assign } = Object;
const { max, min } = Math;

const { mapActions, mapGetters, mapState } = require("vuex");

const binarySearch = require("../lib/binary-search");
const { pageSigil } = require("../lib/manuscript");
const verse = require("../lib/verse");

function searchByVerse({ np, p }, query) {
    const scope = verse.p(query) ? p : np;
    const index = binarySearch(scope, query, (col, query) => {
        const { start, end } = col;
        if (verse.compare(start, query) > 0) {
            return 1;
        } else if (verse.compare(end, query) < 0) {
            return -1;
        }
        return 0;
    });
    return index >= 0 ? pageSigil(scope[index]) : undefined;
}


module.exports = {
    name: "facsimile-navbar",

    template: require("./facsimile-navbar.pug")(),

    data: () => ({
        query: "", notFound: false
    }),

    computed: assign({
        prevPage() {
            const { index, pages } = this;
            const prev = index - 1;
            if (prev < 0) {
                return undefined;
            }
            return pages[prev].filter(p => p).shift();
        },

        nextPage() {
            const { index, pages } = this;
            const { length } = pages;

            const next = index + 1;
            if (next >= length) {
                return undefined;
            }
            return pages[next].filter(p => p).shift();
        },

        pageTitle() {
            let { page } = this;
            page = page.filter(p => p).map(p => p.replace(/^0+/, ""));
            return `Bl. ${page.join(", ")}`;
        },

        verseTitle() {
            const [start, end] = this.verses;
            const [startType, endType] = [start, end].map(verse.type);

            return [
                startType, verse.toString(start),
                "–",
                startType == endType ? "" : endType, verse.toString(end)
            ].filter(c => c).join(" ");

        }
    }, mapGetters(
        "metadata", [ "index", "page", "pages", "manuscript", "verses" ]
    ), mapState(
        "route", { "mode": (state) => state.params.mode }
    )),

    watch: {
        manuscript() {
            this.notFound = false;
        }
    },

    methods: assign({
        search() {
            let { query } = this;
            return /[rv]/.test(query) ? this.searchPage() : this.searchVerse();
        },

        searchPage() {
            let { query } = this;
            query = query.replace(/[^0-9rv]/g, "");

            let [, leaf, page ] = /^([0-9]+)([rv])?$/.exec(query);
            leaf = leaf ? parseInt(leaf, 10) || undefined : undefined;
            page = page || "r";

            if (!leaf) {
                this.notFound = true;
                return;
            }

            leaf = max(0, min(999, leaf));
            const sigil = pageSigil({ leaf, page });
            const { manuscript } = this;
            if (manuscript.pages.indexOf(sigil) < 0) {
                this.notFound = true;
                return;
            }

            this.notFound = false;
            this.gotoPage({ page: sigil });
        },

        searchVerse() {
            let { query } = this;
            query = query.replace(/[^0-9.[\]]/g, "");

            try {
                query = verse.parse(query);
            } catch (e) {
                query = undefined;
            }

            if (!query) {
                this.notFound = true;
                return;
            }
            const { manuscript } = this;
            const page = searchByVerse(manuscript, query);
            if (!page) {
                this.notFound = true;
                return;
            }

            this.notFound = false;
            this.gotoPage({ page });
        }

    }, mapActions(
        ["gotoPage"]
    ))
};
