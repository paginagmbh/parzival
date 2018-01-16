const { max, min } = Math;
const facsimiles = require("../../facsimiles.json");

const { length } = facsimiles;

module.exports = {
    namespaced: true,

    getters: {
        position(state, getters, rootState) {
            const { route } = rootState;
            const { name, params } = route;

            return min(length, max(1, parseInt(
                name == "facsimile" ? params.position : "1",
                10
            ) || 1));
        },

        index(state, getters) {
            return getters.position - 1;
        },

        prevPos(state, getters) {
            return max(1, getters.position - 1);
        },

        nextPos(state, getters) {
            return min(length, getters.position + 1);
        },

        currentId(state, getters) {
            return facsimiles[getters.index];
        },

        currentTileSources(state, getters) {
            const id = getters.currentId;
            return [`https://assets.pagina-dh.de/iiif/parzival-${id}.ptif/info.json`];
        }
    }
};