const { mapGetters } = require("vuex");

const { search, searchVerse, searchPage } = require("../lib/search");

module.exports = {
    name: "navigation",
    template: require("./navigation.pug")(),
    mixins: [require("./activation"), require("./routing")],

    computed: mapGetters("metadata", [
        "manuscripts", "manuscript",
        "prevPage", "nextPage"
    ]),

    data: () => ({ searchModal: false, query: "", notFound: false, info: false }),

    methods: {
        search(e, fn=search) {
            let { manuscript, query } = this;
            const page = fn(manuscript, query);
            this.notFound = page === undefined;
            if (page) {
                this.$router.push(this.gotoPage(page));
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