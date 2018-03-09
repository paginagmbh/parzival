const { assign } = Object;

const $ = require("jquery");

require("slick-carousel");

const { mapGetters } = require("vuex");

module.exports = {
    name: "facsimile-carousel",
    template: require("./facsimile-carousel.pug")(),
    computed: assign({

        pages() {
            const { manuscript } = this;
            const { sigil, pages } = manuscript;
            return pages.map(page => ({

                page,
                key: [sigil, page].join("_"),
                src: [
                    "https://assets.pagina-dh.de/iiif",
                    `/parzival-${sigil.toLowerCase()}-${page}.ptif`,
                    "full", ",128", "0", "default.jpg"
                ].join("/")

            }));
        }

    }, mapGetters("metadata", ["manuscript"])),

    methods: {
        slick() {
            this.$nextTick().then(() => $(this.$el).slick({
                arrows: true,
                dots: false,
                infinite: false,
                slidesToShow: 6,
                slidesToScroll: 5
            }));
        }
    },

    mounted() {
        this.slick();
    },

    beforeDestroy() {
        $(this.$el).slick("unslick");
    }
};
