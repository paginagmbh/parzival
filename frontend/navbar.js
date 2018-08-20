const { metadata } = window.parzival;

module.exports = {
    name: "navbar",
    props: ["manuscript", "pages"],

    mixins: [ require("./activation"), require("./manuscript-location")],
    template: require("./navbar.pug")(),

    components: {
        Navigation: require("./navigation")
    },

    data: () => ({  menu: false, menuDrop: false, msDrop: false }),

    computed: {
        manuscripts() {
            return metadata.manuscripts;
        }
    },

    watch: {
        $route() {
            ["menu", "menuDrop", "msDrop"].forEach(k => this[k] = false);
        }
    }
};