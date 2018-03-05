const Vuex = require("vuex");

const modules = {
    facsimile: require("./facsimile"),
    metadata: require("./metadata")
};

module.exports = new Vuex.Store({ modules });