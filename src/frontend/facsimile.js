const { assign } = Object;
const { max, min } = Math;
const $ = require("jquery");

const { mapGetters } = require("vuex");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

const binarySearch = require("../binary-search");
const { pageSigil } = require("../manuscript");
const verse = require("../verse");

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

const Navbar = {
    template: require("./facsimile-navbar.pug")(),

    data: () => ({
        query: "", notFound: false
    }),

    computed: assign({
        noPrevPage() {
            return this.page == this.prevPage;
        },

        noNextPage() {
            return this.page == this.nextPage;
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
    }, mapGetters("metadata", [ "page", "prevPage", "nextPage", "manuscript", "verses" ])),

    watch: {
        manuscript() {
            this.notFound = false;
        }
    },

    methods: {
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
            this.$router.push({ params: { page: sigil } });
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
            this.$router.push({ params: { page } });
        }
    },

    created() {
        this.$html = $("html").addClass("has-navbar-fixed-bottom");
    },

    destroyed() {
        this.$html.removeClass("has-navbar-fixed-bottom");
    }
};

module.exports = {
    components: { Navbar },

    template: require("./facsimile.pug")(),

    computed: mapGetters("metadata", ["tileSources"]),

    watch: {
        tileSources(newSources) {
            if (newSources) {
                this.osd.open(newSources);
            }
        }
    },

    mounted() {
        const [ element ] = $(this.$el).find(".parzival-facsimile");
        const { tileSources } = this;
        const osd = this.osd = OpenSeadragon({
            prefixUrl, element, tileSources,
            showNavigator: true,
            showRotationControl: true,
            debugMode: false
        });

        const upperHalf =  new OpenSeadragon.Rect(0, 0, 1, 0.5);
        const { viewport } = osd;

        osd.addHandler("open", () => {
            viewport.fitBoundsWithConstraints(upperHalf, true);
        });
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};