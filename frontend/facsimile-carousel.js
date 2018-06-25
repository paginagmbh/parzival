const { assign } = Object;

const scrollIntoView = require("scroll-into-view");

const { mapActions, mapGetters, mapMutations, mapState } = require("vuex");

module.exports = {
    name: "facsimile-carousel",

    template: require("./facsimile-carousel.pug")(),

    computed: assign({

        pages() {
            const { manuscript } = this;
            const { sigil, pages } = manuscript;
            return pages.map(page => ({

                page,
                src: [
                    "https://assets.pagina-dh.de/parzival/images",
                    `${sigil.toLowerCase()}-${page}_files`,
                    "8", "0_0.jpeg"
                ].join("/"),
                key: [sigil, page].join("_")

            }));
        }

    }, mapGetters(
        "metadata", ["manuscript", "page"]
    ), mapState(
        "facsimile", { "visible": "carousel" }
    )),

    methods: assign({

        activeSlide({ page }) {
            return this.page.some(p => (page == p));
        }

    }, mapMutations(
        "facsimile", ["openCarousel", "closeCarousel"]
    ), mapActions(
        ["gotoPage"]
    )),

    watch: {
        visible() {
            if (this.visible) {
                this.$nextTick(
                    () => scrollIntoView(this.$el.querySelector(".is-active"))
                );
            }
        }
    }
};
