const { Point, Rect }  = require("openseadragon");

module.exports = {
    namespaced: true,

    state: {
        viewport: new Rect(0, 0, 1, 0.5)
    },

    getters: {
        initialViewport({ viewport }) {
            const { x, y, width, height } = viewport;
            return viewport.clone().translate(new Point(
                width < 1 ? -x : 0,
                height < 1 ? -y : 0
            ));
        }
    },

    mutations: {
        viewportChange(state, { viewport }) {
            state.viewport = viewport;
        }
    }
};