const { assign } = Object;
const $ = require("jquery");

const debounce = require("lodash.debounce");

const { mapGetters, mapMutations } = require("vuex");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

module.exports = {
    components: {
        Navbar: require("./facsimile-navbar")
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
            this.osd.close();

            const { tileSources } = this;
            let { length } = tileSources;
            const width = 1 / length;

            const success = () => {
                if (--length == 0) {
                    this.osd.viewport.fitBoundsWithConstraints(
                        this.initialViewport,
                        true
                    );
                }
            };

            tileSources.map((tileSource, ti) => (tileSource === undefined ? undefined : {
                tileSource, width, x: (ti * width), success
            })).filter(ts => ts).forEach(
                tiledImage => this.osd.addTiledImage(tiledImage)
            );
        }

    }, mapMutations("facsimile", ["viewportChange"])),

    watch: {
        tileSources() {
            this.openPages();
        }
    },

    mounted() {
        const [ element ] = $(this.$el).find(".parzival-facsimile");
        const osd = this.osd = OpenSeadragon({
            prefixUrl, element,
            showNavigator: true,
            showRotationControl: true,
            debugMode: false
        });

        const { viewport } = osd;
        osd.addHandler("viewport-change", debounce(() => {
            this.viewportChange(
                { viewport: viewport.getConstrainedBounds() }
            );
        }, 250, { leading: true }));

        this.openPages();
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};