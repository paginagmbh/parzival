const { mapGetters } = require("vuex");

module.exports = {
    name: "navbar",
    mixins: [require("./activation"), require("./routing")],

    template: require("./navbar.pug")(),
    components: {
        Navigation: require("./navigation")
    },

    computed: mapGetters("metadata", [ "manuscripts", "manuscript" ]),

    data: () => ({  menu: false, menuDrop: false, msDrop: false }),

    watch: {
        $route() {
            ["menu", "menuDrop", "msDrop"].forEach(k => this[k] = false);
        }
    }
};