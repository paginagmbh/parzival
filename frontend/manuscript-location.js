const { parsePageSigil, pageSigil } = require("../lib/manuscript");
const quire = require("../lib/quire");
const verse = require("../lib/verse");

const { metadata } = window.parzival;
const { transcript } = window.parzival.transcript;

const pages = {
    single: {},
    double: {}
};

const sequences = {
    single: {},
    double: {}
};

for (const sigil in metadata.manuscripts) {
    const manuscript = metadata.manuscripts[sigil];
    for (const key of ["single", "double"]) {
        pages[key][sigil] = [];
        sequences[key][sigil] = {};
    }
    for (let pi = 0, pl = manuscript.pages.length; pi < pl; pi++) {
        const page = manuscript.pages[pi];
        sequences.single[sigil][page] = pages.single[sigil].length;
        pages.single[sigil].push(page);
    }

    const leafs = quire.leafs(manuscript.pages.map(parsePageSigil));
    for (let li = 0, ll = leafs.length; li < ll; li++) {
        const leaf = leafs[li].map(l => l ? pageSigil(l) : "").join(",");
        for (let page of leafs[li]) {
            if (!page) {
                continue;
            }
            sequences.double[sigil][pageSigil(page)] = pages.double[sigil].length;
            pages.double[sigil].push(leaf);
        }
    }
}


module.exports = {
    computed: {
        pageList() {
            const pages = this.pages || "";
            if (pages == "") {
                return [];
            }
            return pages.toLowerCase().split(/,\s*/g);
        },

        page() {
            return this.pageList.find(p => p);
        },

        hasTranscript() {
            const columns = transcript[this.manuscript || ""] || {};
            for (const page of this.pageList) {
                for (const column of ["a", "b"]) {
                    if (columns[`${page}${column}`]) {
                        return true;
                    }
                }
            }
            return false;
        },

        manuscriptTitle() {
            return metadata.manuscripts[this.manuscript].title;
        },

        pageTitle() {
            return "Bl. " + this.pageList.filter(p => p).join(",");
        },

        verseTitle() {
            const { columns } = metadata.manuscripts[this.manuscript];
            let start = undefined;
            let end = undefined;
            for (const page of this.pageList) {
                if (page) {
                    for (const column of ["a", "b"]) {
                        const sigil = `${page}${column}`;
                        if (sigil in columns) {
                            const verses = columns[sigil];
                            start = start || verses.start;
                            end = verses.end;
                        }
                    }
                }
            }
            return [verse.toString(start), verse.toString(end)].join("-");
        },

        routes() {
            const manuscripts = {
                V: this.turnedPage(this.toPage("001r", "V")),
                VV: this.turnedPage(this.toPage("001r", "VV"))
            };

            return {
                manuscripts,

                otherManuscript: this.manuscript == "V"
                    ? manuscripts.VV
                    : manuscripts.V,

                prevPage: this.prevPage(this.turnedPage(this.toPage())),

                nextPage: this.nextPage(this.turnedPage(this.toPage())),

                overview: {
                    ...this.toPage(),
                    name: "overview"
                },

                transcript: {
                    ...this.turnedPage(this.toPage(null, null, 1)),
                    name: "transcript"
                },

                doublePage: {
                    ...this.turnedPage(this.toPage(null, null, 2)),
                    name: "facsimile"
                },

                singlePage: {
                    ...this.turnedPage(this.toPage(null, null, 1)),
                    name: "facsimile"
                }
            };
        }
    },

    methods: {
        turnedPage(route) {
            if (!route.query) {
                return route;
            }
            let { x, y, width } = route.query;
            if (x && y && width) {
                x = (
                    Math.round((1 - (parseFloat(width) || "1")) * 50) / 100
                ).toString();
                y = "0";
                return { ...route, query: { ...route.query, x, y } };
            }
            return route;
        },

        nextPage(route) {
            const { manuscript, page } = this;
            const count = Math.min(2, this.pageList.length);
            const key = count == 2 ? "double" : "single";
            const { length } = pages[key][manuscript];
            const index = Math.min(
                sequences[key][manuscript][page] + count,
                length - 1
            );
            const next =  pages[key][manuscript][index];
            return { ...route, params: { ...route.params, pages: next } };
        },

        prevPage(route) {
            const { manuscript, page } = this;
            const count = Math.min(2, this.pageList.length);
            const key = count == 2 ? "double" : "single";
            const index = Math.max(0, sequences[key][manuscript][page] - count);
            const prev = pages[key][manuscript][index];
            return { ...route, params: { ...route.params, pages: prev } };
        },

        toPage(page, manuscript, count) {
            const { name, query, params } = this.$route;
            manuscript = manuscript || params.manuscript;
            page = page || this.page;
            count = count || this.pageList.length;
            switch (count) {
            case 2:
                page = pages.double[manuscript][sequences.double[manuscript][page]];
                break;
            case 1:
            default:
                page = pages.single[manuscript][sequences.single[manuscript][page]];
                break;
            }

            return { name, query, params: { ...params, manuscript, pages: page } };
        }
    }
};
