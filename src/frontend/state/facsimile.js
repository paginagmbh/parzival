const facsimiles = require("../../facsimiles.json");

const last = facsimiles.length - 1;

module.exports = {
    namespaced: true,

    state: {
        current: 0
    },

    getters: {
        currentId(state) {
            return facsimiles[state.current];
        },

        currentTileSources(state, getters) {
            const id = getters.currentId;
            return [`https://assets.pagina-dh.de/iiif/parzival-${id}.ptif/info.json`];
        }
    },

    mutations: {
        next(state) {
            state.current = Math.min(state.current + 1, last);
        },

        prev(state) {
            state.current = Math.max(state.current - 1, 0);
        }
    }
};