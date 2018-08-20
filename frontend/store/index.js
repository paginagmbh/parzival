const Vuex = require("vuex");
const { Point, Rect }  = require("openseadragon");

module.exports = new Vuex.Store({
    state: {
        manuscript: "V",
        page: "001r",
        mode: "double-page",
        viewport: new Rect(0, 0, 1, 0.5)
 },

    getters: {
        route({ manuscript, page, mode  }) {
            return { name: mode, params: { manuscript, page } };
        },

        initialViewport({ viewport }) {
            const { x, y, width, height } = viewport;
            return viewport.clone().translate(new Point(
                -x + (width < 1 ? 0 : (1 - width) / 2),
                -y + (height < 1 ? 0 : (1 - height) / 2)
            ));
        },

        title({ manuscript }, { pageTitle }) {
            return ["Nuwer Parzifal", manuscript, pageTitle].join(" – ");
        },

        pageTitle({ page, mode }) {
            return [page, mode].join(" – ");
        }
    },

    mutations: {
        update(state, { manuscript, page, mode }) {
            Object.assign(state, { manuscript, page, mode });
        },

        viewportChange(state, { viewport }) {
            Object.assign(state, { viewport });
        }
    }
});