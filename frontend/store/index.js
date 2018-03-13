const { assign } = Object;

const Vuex = require("vuex");

const router = require("../router");

const modules = {
    facsimile: require("./facsimile"),
    metadata: require("./metadata")
};

module.exports = new Vuex.Store({
    modules,

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