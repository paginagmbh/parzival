const Vuex = require("vuex");

const modules = {
    facsimile: require("./facsimile"),
    metadata: require("./metadata"),
    text: require("./text")
};

module.exports = new Vuex.Store({
    modules,

    state: {
        manuscript: "V",
        page: "001r",
        mode: "double-page"
    },

    getters: {
        route({ manuscript, page, mode  }) {
            return { name: mode, params: { manuscript, page } };
        }
    },

    mutations: {
        update(state, { manuscript, page, mode }) {
            Object.assign(state, { manuscript, page, mode });
        }
    }
});