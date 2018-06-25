const { assign } = Object;

const debounce = require("lodash.debounce");

const { mapGetters, mapMutations } = require("vuex");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

module.exports = {
    name: "facsimile",

    components: {
        Navbar: require("./navbar"),
        FacsimileNavbar: require("./facsimile-navbar"),
        Carousel: require("./facsimile-carousel"),
        Quire: require("./quire")
    },

    template: require("./facsimile.pug")(),

    computed: assign(
        {},
        mapGetters("facsimile", ["initialViewport"]),
        mapGetters("metadata", ["tileSources"])
    ),

    methods: assign({

        openPages() {
            if (!this.osd) {
                return;
            }
            this.imageOpen = false;
            this.osd.close();

            const { tileSources } = this;
            let { length } = tileSources;
            const width = 1 / length;

            const success = () => {
                if (--length == 0) {
                    this.imageOpen = true;
                    this.osd.viewport.fitBounds(
                        this.initialViewport,
                        true
                    );
                    this.updateViewport();
                }
            };

            tileSources.map((tileSource, ti) => (tileSource === undefined ? undefined : {
                tileSource, width, x: (ti * width), success
            })).filter(ts => ts).forEach(
                tiledImage => this.osd.addTiledImage(tiledImage)
            );
        },

        withOpenImage(fn) {
            const { osd, imageOpen } = this;
            return osd ? fn(osd, imageOpen) : false;
        },

        updateViewport() {
            this.withOpenImage(({ viewport }, imageOpen) => imageOpen ? this.viewportChange(
                { viewport: viewport.getConstrainedBounds() }
            ) : false);
        },

        zoomIn() {
            this.withOpenImage(({ viewport }) => viewport.zoomBy(2));
        },

        zoomOut() {
            this.withOpenImage(({ viewport }) => viewport.zoomBy(0.5));

        },

        rotate(degrees) {
            this.withOpenImage(
                ({ viewport }) => viewport.setRotation(viewport.getRotation() + degrees)
            );
        },

        rotateLeft() {
            this.rotate(-90);
        },

        rotateRight() {
            this.rotate(90);
        }

    }, mapMutations("facsimile", ["viewportChange", "openCarousel"])),

    watch: {
        tileSources() {
            this.openPages();
        }
    },

    created() {
        this.imageOpen = false;
    },

    mounted() {
        const element = this.$el.querySelector(".parzival-facsimile");
        const osd = this.osd = OpenSeadragon({
            prefixUrl, element,
            showNavigator: true,
            showNavigationControl: false,
            showRotationControl: false,
            debugMode: false
        });

        osd.addHandler("viewport-change", debounce(
            this.updateViewport.bind(this), 250, { leading: true }
        ));

        this.openPages();
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};