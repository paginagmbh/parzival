const { mapActions, mapGetters } = require("vuex");

module.exports = {
    name: "transcript",
    mixins: [require("./routing"), require("./routing-view")],

    template: require("./transcript.pug")(),
    components: {
        Navbar: require("./navbar"),
        Navigation: require("./navigation"),
        FacsimileViewer: require("./facsimile-viewer")
    },

    computed: {
        ...mapGetters("metadata", ["manuscript", "pageTitle", "verseTitle", "page"]),
        ...mapGetters("text", ["columns"]),

        available() {
            const { columns } = this;
            for (const column in columns) {
                if (columns[column].verses.length > 0) {
                    return true;
                }
            }
            return false;
        }
    }
};