const scrollIntoView = require("scroll-into-view");

const { mapGetters } = require("vuex");

const { thumb } = require("./images");

module.exports = {
    name: "overview",
    mixins: [require("./routing")],

    template: require("./overview.pug")(),

    computed: {
        ...mapGetters("metadata", ["manuscript", "page"]),
        ...mapGetters("text", { "transcript": "pages" }),

        pages() {
            const { manuscript, transcript } = this;
            const { sigil } = manuscript;
            return manuscript.pages.map(page => {
                const columns = transcript[page] || {};
                const verses = Object.keys(columns)
                      .some(c => columns[c].verses.length > 0);

                const src = thumb(sigil, page);
                const key = [sigil, page].join("_");
                return { page, verses, src, key };
            });
        }

    },

    methods: {
        close() {
            this.$router.back();
        },

        transcriptClass({ verses }) {
            return { "is-italic": verses, "has-text-weight-bold": verses };
        },

        activeSlide({ page }) {
            return this.page.some(p => (page == p));
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
