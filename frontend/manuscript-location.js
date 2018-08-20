const { parsePageSigil, pageSigil } = require("../lib/manuscript");
const quire = require("../lib/quire");

const { metadata } = window.parzival;

const pages = {
    single: {},
    double: {}
};

const sequences = {
    single: {},
    double: {}
};

for (const manuscript of metadata.manuscripts) {
    const { sigil } = manuscript;
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

        manuscriptTitle() {
            return metadata.manuscripts
                .filter(({ sigil }) => sigil == this.manuscript)
                .map(({ title }) => title)
                .shift();
        },

        pageTitle() {
            return this.pageList.filter(p => p).join(",");
        },

        verseTitle() {
            return "?";
        },

        routes() {
            const { manuscript, page } = this;
            const { name, params, query } = this.$route;
            return {
                manuscripts: {
                    V: {
                        name, query,
                        params: {
                            ...params,
                            manuscript: "V",
                            pages: this.resolve("V", "001r")
                        }
                    },
                    VV: {
                        name, query,
                        params: {
                            ...params,
                            manuscript: "VV",
                            pages: this.resolve("VV", "001r")
                        }
                    }
                },

                prevPage: {
                    name, query,
                    params: { ...params, pages: this.prevPage(manuscript, page) }
                },
                nextPage: {
                    name, query,
                    params: { ...params, pages: this.nextPage(manuscript, page) }
                },

                transcript: { name: "transcript", params, query },
                overview: { name: "overview", params, query },

                doublePage: {
                    name, query,
                    params: { ...params, pages: this.resolve(manuscript, page, 2) }
                },
                singlePage: {
                    name, query,
                    params: { ...params, pages: this.resolve(manuscript, page, 1) }                    }
            };
        }
    },

    methods: {
        nextPage(manuscript, page) {
            const count = Math.min(2, this.pageList.length);
            const key = count == 2 ? "double" : "single";
            const { length } = pages[key][manuscript];
            const index = Math.min(
                sequences[key][manuscript][page] + count,
                length - 1
            );
            return pages[key][manuscript][index];
        },

        prevPage(manuscript, page) {
            const count = Math.min(2, this.pageList.length);
            const key = count == 2 ? "double" : "single";
            const index = Math.max(0, sequences[key][manuscript][page] - count);
            return pages[key][manuscript][index];
        },

        resolve(manuscript, page, count) {
            count = count || this.pageList.length;
            switch (count) {
            case 2:
                return pages.double[manuscript][sequences.double[manuscript][page]];
            case 1:
            default:
                return pages.single[manuscript][sequences.single[manuscript][page]];
            }
        }
    }
};
