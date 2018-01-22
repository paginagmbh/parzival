const { Point, Rect }  = require("openseadragon");

module.exports = {
    namespaced: true,

    state: {
        viewport: new Rect(0, 0, 1, 0.5)
    },

    getters: {
        initialViewport({ viewport }) {
            const { x, y } = viewport;
            return viewport.clone().translate(new Point(-x, -y));
        }
    },

    mutations: {
        viewportChange(state, { viewport }) {
            state.viewport = viewport;
        }
    }
};