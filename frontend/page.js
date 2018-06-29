const { mapGetters } = require("vuex");

module.exports = {
    name: "page",
    mixins: [require("./routing-view")],

    components: {
        Navbar: require("./navbar"),
        Navigation: require("./navigation"),
        FacsimileViewer: require("./facsimile-viewer")
    },

    template: require("./page.pug")(),

    computed: mapGetters("metadata", ["manuscript", "pageTitle", "verseTitle"])
};