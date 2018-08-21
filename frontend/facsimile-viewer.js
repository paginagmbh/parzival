const debounce = require("lodash.debounce");

const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

const { dzi } = require("./images");

const { metadata } = window.parzival;

module.exports = {
    name: "facsimile-viewer",
    props: ["manuscript", "pages"],

    mixins: [require("./manuscript-location")],
    template: require("./facsimile-viewer.pug")(),

    computed: {
        viewport() {
            let { x, y, width, height } = this.$route.query;
            x = parseFloat(x || "0") || 0;
            y = parseFloat(y || "0") || 0;
            width = parseFloat(width || "1") || 1;
            height = parseFloat(height || "0.5") || 0.5;

            return new OpenSeadragon.Rect(x, y, width, height, 0);
        },

        quireIconPath() {
            const { manuscript, pageList } = this;
            const [ page ] = pageList;
            let { quires } = metadata.manuscripts[manuscript];

            let quireIcon = undefined;
            if (page in quires) {
                switch (pageList.length) {
                case 1:
                    quireIcon = quires[page].singlePage;
                    break;
                case 2:
                    quireIcon = quires[page].doublePage;
                    break;
                }
            }
            return quireIcon ? `/quire-icons/${quireIcon}.gif` : quireIcon;
        }
    },

    methods: {
        openPages() {
            if (!this.osd) {
                return;
            }
            this.imageOpen = false;
            this.osd.close();

            const { manuscript, pageList } = this;
            let { length } = pageList;
            const width = 1 / length;

            const success = () => {
                if (--length == 0) {
                    this.imageOpen = true;
                    this.osd.viewport.fitBounds(
                        this.viewport,
                        true
                    );
                    this.updateViewport();
                }
            };

            pageList.forEach((page, pi) => {
                if (page !== undefined) {
                    this.osd.addTiledImage({
                        tileSource: dzi(manuscript, page),
                        width,
                        x: (pi * width),
                        success
                    });
                }
            });
        },

        withOpenImage(fn) {
            const { osd, imageOpen } = this;
            return osd ? fn(osd, imageOpen) : false;
        },

        updateViewport() {
            this.withOpenImage(({ viewport }, imageOpen) => {
                if (!imageOpen) return;

                viewport = viewport.getConstrainedBounds();

                const [x, y, width, height] = ["x", "y", "width", "height"]
                      .map(k => (Math.round(viewport[k] * 100) / 100).toString());

                this.$router.replace({
                    ...this.$route,
                    query: { x, y, width, height }
                });

            });
        },

        zoomIn() {
            this.withOpenImage(({ viewport }) => viewport.zoomBy(2));
        },

        zoomOut() {
            this.withOpenImage(({ viewport }) => viewport.zoomBy(0.5));

        },

        rotate(degrees) {
            this.withOpenImage(({ viewport }) => viewport.setRotation(
                viewport.getRotation() + degrees
            ));
        },

        rotateLeft() {
            this.rotate(-90);
        },

        rotateRight() {
            this.rotate(90);
        }

    },

    watch: {
        manuscript() {
            this.openPages();
        },

        pages() {
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
            this.updateViewport.bind(this), 50, { leading: true }
        ));

        this.openPages();
    },

    beforeDestroy() {
        if (this.osd) {
            this.osd.destroy();
        }
    }
};