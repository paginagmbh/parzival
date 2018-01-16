const Vuex = require("vuex");

const modules = {
    facsimiles: require("./facsimile"),
    metadata: require("./metadata")
};

module.exports = new Vuex.Store({ modules });