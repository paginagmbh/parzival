const { assign } = Object;

const $ = require("jquery");
const scrollIntoView = require("scroll-into-view");

const { mapActions, mapGetters, mapMutations, mapState } = require("vuex");

module.exports = {
    name: "facsimile-carousel",

    template: require("./facsimile-carousel.pug")(),

    computed: assign({

        pages() {
            const { manuscript } = this;
            const { sigil, pages } = manuscript;
            // https://assets.pagina-dh.de/parzival/images/v-002v_files/9/0_0.jpeg
            return pages.map(page => ({

                page,
                src: [
                    "https://assets.pagina-dh.de/iiif",
                    `/parzival-${sigil.toLowerCase()}-${page}.ptif`,
                    "full", ",256", "0", "default.jpg"
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

        highlight() {
            this.$nextTick().then(() => {
                if (!this.visible) {
                    return;
                }
                let page = this.page.filter(p => p);

                const $slides = $(this.$el).find(".parzival-facsimile-slide");

                $slides.removeClass("is-active");
                page.forEach((p, pi) => {
                    const [ slide ] = $slides
                          .filter(`[data-page='${p}']`)
                          .addClass("is-active");

                    if (pi == 0) {
                        scrollIntoView(slide);
                    }
                });


            });
        }

    }, mapMutations(
        "facsimile", ["openCarousel", "closeCarousel"]
    ), mapActions(
        ["gotoPage"]
    )),

    mounted() {
        $(document).on("keypress", this.escapeHandler = (e) => {
            if (!this.visible) {
                return;
            }
            switch (e.keyCode) {
            case 27: // esc
                this.closeCarousel();
                break;
            }
        });
        this.highlight();
    },

    updated() {
        this.highlight();
    },

    beforeDestroy() {
        $(document).off("keypress", this.escapeHandler);
    }
};
