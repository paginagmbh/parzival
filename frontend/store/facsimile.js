const { Point, Rect }  = require("openseadragon");

module.exports = {
    namespaced: true,

    state: {
        carousel: true,
        viewport: new Rect(0, 0, 1, 0.5)
    },

    getters: {
        initialViewport({ viewport }) {
            const { x, y, width, height } = viewport;
            return viewport.clone().translate(new Point(
                -x + (width < 1 ? 0 : (1 - width) / 2),
                -y + (height < 1 ? 0 : (1 - height) / 2)
            ));
        }
    },

    mutations: {
        openCarousel(state) {
            state.carousel = true;
        },

        closeCarousel(state) {
            state.carousel = false;
        },

        viewportChange(state, { viewport }) {
            state.viewport = viewport;
        }
    }
};