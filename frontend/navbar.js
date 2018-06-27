const { mapGetters } = require("vuex");

const { search, searchVerse, searchPage } = require("../lib/search");

module.exports = {
    name: "navbar",
    mixins: [require("./routing")],

    template: require("./navbar.pug")(),

    computed: {
        ...mapGetters("metadata", [
            "manuscripts", "manuscript",
            "prevPage", "nextPage",
            "pageTitle", "verseTitle"
        ]),

        options() {
            const current = this.manuscript.sigil;
            return this.manuscripts.filter(({ sigil }) => sigil != current);
        }
    },

    data: () => ({
        menu: false, menuDrop: false, msDrop: false, searchDrop: false,
        query: "", notFound: false
    }),

    methods: {
        toggle(k) {
            const value = (this[k] = !this[k]);
            if (value) {
                ["searchDrop", "menuDrop", "msDrop", "menu"]
                    .filter(d => d != k)
                    .forEach(d => this[d] = false);
            }
        },

        search(e, fn=search) {
            let { manuscript, query } = this;
            const page = fn(manuscript, query);
            this.notFound = page === undefined;
            if (page) {
                this.$router.push(this.gotoPage(page));
                this.toggle("searchDrop");
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
        manuscript() {
            this.notFound = false;
        }
    },

};