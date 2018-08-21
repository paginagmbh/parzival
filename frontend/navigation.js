const { search, searchVerse, searchPage } = require("../lib/search");

const { metadata } = window.parzival;

module.exports = {
    name: "navigation",
    template: require("./navigation.pug")(),

    mixins: [
        require("./activation"),
        require("./manuscript-location")
    ],

    props: ["manuscript", "pages"],

    data: () => ({
        searchModal: false,
        query: "",
        notFound: false,
        info: false
    }),

    methods: {
        search(e, fn=search) {
            const { query } = this;
            const manuscript = metadata.manuscripts[this.manuscript];
            const page = fn(manuscript, query);
            this.notFound = page === undefined;
            if (page) {
                this.$router.push(this.toPage(page));
                this.toggle("searchModal");
            }
        },

        searchVerse(e) {
            return this.search(e, searchVerse);
        },

        searchPage(e) {
            return this.search(e, searchPage);
        }
    },

    watch: {
        $route() {
            this.info = false;
        },

        manuscript() {
            this.notFound = false;
        }
    }
};