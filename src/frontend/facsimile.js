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

    methods: mapMutations("facsimile", ["viewportChange"]),

    watch: {
        tileSources(newSources) {
            if (newSources) {
                this.osd.open(newSources);
            }
        }
    },

    mounted() {
        const [ element ] = $(this.$el).find(".parzival-facsimile");
        const { tileSources } = this;
        const osd = this.osd = OpenSeadragon({
            prefixUrl, element, tileSources,
            showNavigator: true,
            showRotationControl: true,
            debugMode: false
        });

        const { viewport } = osd;

        osd.addHandler("open", () => {
            viewport.fitBoundsWithConstraints(this.initialViewport, true);
        });

        osd.addHandler("viewport-change", debounce(() => {
            this.viewportChange(
                { viewport: viewport.getConstrainedBounds() }
            );
        }, 500, { leading: true }));
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};