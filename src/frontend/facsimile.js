const { assign } = Object;
const $ = require("jquery");

const { mapGetters } = require("vuex");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

const Navbar = {
    template: require("./facsimile-navbar.pug")(),
    computed: mapGetters("metadata", [
        "prevPage", "noPrevPage",
        "nextPage", "noNextPage",
        "sigil", "page", "title"
    ]),

    created() {
        this.$html = $("html").addClass("has-navbar-fixed-bottom");
    },

    destroyed() {
        this.$html.removeClass("has-navbar-fixed-bottom");
    }
};

module.exports = {
    components: { Navbar },

    template: require("./facsimile.pug")(),

    computed: mapGetters("metadata", ["tileSources"]),

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