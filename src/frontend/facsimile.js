const $ = require("jquery");

const { mapGetters } = require("vuex");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";
const { BOTTOM_RIGHT } = OpenSeadragon.ControlAnchor;

module.exports = {
    template: `<div class="facsimile"></div>`,

    computed: mapGetters("facsimiles", {
        tileSources: "currentTileSources",
        facsimile: "currentId"
    }),

    watch: {
        tileSources(newSources) {
            this.osd.open(newSources);
        }
    },

    created() {
        this.$html = $("html").addClass("has-navbar-fixed-top");
    },

    destroyed() {
        this.$html.removeClass("has-navbar-fixed-top");
    },

    mounted() {
        const element = this.$el;
        const { tileSources } = this;
        const osd = this.osd = OpenSeadragon({
            prefixUrl, element, tileSources,
            showNavigator: true,
            showRotationControl: true,
            debugMode: false
        });

        const $pageLabel = $("<div></div").addClass("page-label");
        const [ pageLabelElement ] = $pageLabel;
        osd.addControl(pageLabelElement, { anchor: BOTTOM_RIGHT });

        const upperHalf =  new OpenSeadragon.Rect(0, 0, 1, 0.5);
        const { viewport } = osd;

        osd.addHandler("open", () => {
            viewport.fitBoundsWithConstraints(upperHalf, true);
            $pageLabel.text(this.facsimile.toUpperCase());
        });
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};