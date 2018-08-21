const scrollIntoView = require("scroll-into-view");

const { search, searchVerse, searchPage } = require("../lib/search");
const { thumb } = require("./images");

const { metadata } = window.parzival;
const { transcript } = window.parzival.transcript;

module.exports = {
    name: "navigation",
    template: require("./container.pug")(),

    mixins: [
        require("./activation"),
        require("./manuscript-location")
    ],

    props: ["manuscript", "pages"],

    data: () => ({
        overviewModal: false,
        searchModal: false,
        query: "",
        notFound: false,
        info: false
    }),

    computed: {
        manuscriptPages() {
            const { manuscript } = this;
            const { pages } = metadata.manuscripts[manuscript];
            return pages.map(page => {
                const verses = ["a", "b"]
                      .some(c => transcript[manuscript][`${page}${c}`]);
                const src = thumb(manuscript, page);
                const key = [manuscript, page].join("_");
                return { page, verses, src, key };
            });
        }
    },

    methods: {
        pageRoute({ page }) {
            return this.toPage(page);
        },

        transcriptClass({ verses }) {
            return { available: verses };
        },

        activeSlide({ page }) {
            return this.pageList.some(p => (page == p));
        },

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
            this.overviewModal = false;
            this.searchModal = false;
            this.info = false;
        },

        overviewModal() {
            if (this.overviewModal) {
                this.$nextTick(
                    () => scrollIntoView(this.$el.querySelector(
                        ".parzival-overview .is-active"
                    ))
                );
            }
        }
    }
};