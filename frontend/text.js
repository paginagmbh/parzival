const { mapActions, mapGetters } = require("vuex");

module.exports = {
    name: "text",
    mixins: [require("./routing"), require("./routing-view")],

    template: require("./text.pug")(),
    components: {
        Navbar: require("./navbar"),
        FacsimileNavbar: require("./facsimile-navbar")
    },

    computed: {
        ...mapGetters("text", ["columns"])
    },

    methods: {
        ...mapActions("text", ["load"])
    },

    mounted() {
        this.load();
    }
};