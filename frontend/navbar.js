const { mapGetters } = require("vuex");

module.exports = {
    name: "navbar",
    mixins: [require("./routing")],

    template: require("./navbar.pug")(),

    computed: mapGetters("metadata", ["manuscripts", "manuscript"]),

    data: () => ({ menu: false, msDrop: false }),

    methods: {
        toggleMenu() {
            this.menu = !this.menu;
        },

        toggleMsDrop() {
            this.msDrop = !this.msDrop;
        }
    }
};