const { mapActions, mapGetters } = require("vuex");

module.exports = {
    name: "text",
    mixins: [require("./routing"), require("./routing-view")],

    template: require("./text.pug")(),
    components: {
        Navbar: require("./navbar"),
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