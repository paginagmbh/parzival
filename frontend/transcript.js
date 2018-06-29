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
        ...mapGetters("metadata", ["pageTitle", "page"]),
        ...mapGetters("text", ["columns"])
    },

    methods: {
        ...mapActions("text", ["load"])
    },

    mounted() {
        this.load();
    }
};