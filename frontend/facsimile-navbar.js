const { mapGetters, mapState } = require("vuex");

const { search, searchVerse, searchPage } = require("../lib/search");

module.exports = {
    name: "facsimile-navbar",
    mixins: [require("./routing")],
    template: require("./facsimile-navbar.pug")(),

    data: () => ({ query: "", notFound: false }),

    computed: {
        ...mapState(["mode"]),
        ...mapGetters(
            "metadata", ["manuscript", "prevPage", "nextPage", "pageTitle", "verseTitle" ]
        )
    },

    watch: {
        manuscript() {
            this.notFound = false;
        }
    },

    methods: {
        search(e, fn=search) {
            let { manuscript, query } = this;
            const page = fn(manuscript, query);
            this.notFound = page === undefined;
            if (page) {
                this.$router.push(this.gotoPage(page));
            }
        },

        searchVerse(e) {
            return this.search(e, searchVerse);
        },

        searchPage(e) {
            return this.search(e, searchPage);
        }
    }
};
