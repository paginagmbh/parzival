const scrollIntoView = require("scroll-into-view");

const { thumb } = require("./images");

const { metadata } = window.parzival;
const { transcript } = window.parzival.transcript;

module.exports = {
    name: "overview",
    props: ["manuscript", "pages"],

    mixins: [require("./manuscript-location")],
    template: require("./overview.pug")(),

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
        close() {
            this.$router.back();
        },

        pageRoute({ page }) {
            return { ...this.toPage(page), name: "facsimile" };
        },

        transcriptClass({ verses }) {
            return { available: verses };
        },

        activeSlide({ page }) {
            return this.pageList.some(p => (page == p));
        },

        scrollToActive() {
            this.$nextTick(
                () => scrollIntoView(this.$el.querySelector(".is-active"))
            );
        }

    },

    mounted() {
        this.scrollToActive();
    },

    activated() {
        this.scrollToActive();
    }
};
