const scrollIntoView = require("scroll-into-view");

const { mapGetters } = require("vuex");

const { thumb } = require("./images");

module.exports = {
    name: "overview",
    mixins: [require("./routing")],

    template: require("./overview.pug")(),

    computed: {
        ...mapGetters("metadata", ["manuscript", "page"]),

        pages() {
            const { manuscript } = this;
            const { sigil, pages } = manuscript;
            return pages.map(page => ({
                page,
                src: thumb(sigil, page),
                key: [sigil, page].join("_")
            }));
        }

    },

    methods: {
        close() {
            this.$router.back();
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
