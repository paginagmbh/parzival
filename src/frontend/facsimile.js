const { assign } = Object;
const $ = require("jquery");

const { mapGetters } = require("vuex");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";
const { BOTTOM_RIGHT } = OpenSeadragon.ControlAnchor;

const Toolbar = {
    template: require("./facsimile-toolbar.pug")(),
    computed: assign({

        noPrevPage() {
            return this.position == this.prevPos;
        },

        noNextPage() {
            return this.position == this.nextPos;
        }

    }, mapGetters("facsimiles", ["position", "prevPos", "nextPos", "currentId"])),

    methods: {
        prevPage() {
            this.$router.push({ name: "facsimile", params: { position: this.prevPos } });
        },

        nextPage() {
            this.$router.push({ name: "facsimile", params: { position: this.nextPos } });
        }

    }
};

module.exports = {
    components: { Toolbar },

    template: require("./facsimile.pug")(),

    computed: mapGetters("facsimiles", ["currentTileSources"]),

    watch: {
        currentTileSources(newSources) {
            if (newSources) {
                this.osd.open(newSources);
            }
        }
    },

    mounted() {
        const [ element ] = $(this.$el).find(".parzival-facsimile");
        const tileSources = this.currentTileSources;
        const osd = this.osd = OpenSeadragon({
            prefixUrl, element, tileSources,
            showNavigator: true,
            showRotationControl: true,
            debugMode: false
        });

        const upperHalf =  new OpenSeadragon.Rect(0, 0, 1, 0.5);
        const { viewport } = osd;

        osd.addHandler("open", () => {
            viewport.fitBoundsWithConstraints(upperHalf, true);
        });
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};