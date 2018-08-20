module.exports = {
    name: "facsimile",
    props: ["manuscript", "pages"],

    mixins: [require("./manuscript-location")],

    components: {
        Navbar: require("./navbar"),
        Navigation: require("./navigation"),
        FacsimileViewer: require("./facsimile-viewer")
    },

    template: require("./facsimile.pug")()
};