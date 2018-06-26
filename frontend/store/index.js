const { assign } = Object;

const Vuex = require("vuex");

const router = require("../router");

const modules = {
    facsimile: require("./facsimile"),
    metadata: require("./metadata"),
    transcript: require("./transcript")
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
    },

    actions: {
        gotoPage({ commit, state }, { sigil, page }) {
            commit("facsimile/closeCarousel");

            const { route } = state;
            const { name, params } = route;
            const defaults = (name == "facsimile" ? params : {
                sigil: "V", page: "001r", mode: "double-page"
            });

            sigil = sigil || defaults.sigil;
            page = page || defaults.page;

            router.push({
                name: "facsimile",
                params: assign({}, defaults, { sigil, page })
            });
        }
    }

});