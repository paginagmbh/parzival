const { mapGetters } = require("vuex");

module.exports = {
    name: "facsimile",
    mixins: [require("./routing-view")],

    components: {
        Navbar: require("./navbar"),
        FacsimileViewer: require("./facsimile-viewer"),
        Quire: require("./quire")
    },

    template: require("./facsimile.pug")(),

    computed: mapGetters("metadata", ["manuscript", "pageTitle", "verseTitle"])
};