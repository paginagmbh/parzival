const { assign } = Object;

const Vuex = require("vuex");

const router = require("../router");

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
        mode: "double-page",
        view: "facsimile"
    },

    getters: {
        route({ manuscript, page, mode, view  }) {
            return { name: view, params: { manuscript, page, mode } };
        }
    },

    mutations: {
        update(state, { manuscript, page, mode, view }) {
            Object.assign(state, { manuscript, page, mode, view });
        }
    }
});