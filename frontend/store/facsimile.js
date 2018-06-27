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
                -x + (width < 1 ? 0 : (1 - width) / 2),
                -y + (height < 1 ? 0 : (1 - height) / 2)
            ));
        }
    },

    mutations: {
        viewportChange(state, { viewport }) {
            Object.assign(state, { viewport });
        }
    }
};