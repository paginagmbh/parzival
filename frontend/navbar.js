const $ = require("jquery");

const { mapGetters } = require("vuex");

module.exports = {
    name: "navbar",

    template: require("./navbar.pug")(),

    computed: mapGetters("metadata", ["manuscripts", "manuscript"]),

    created() {
        this.$html = $("html").addClass("has-navbar-fixed-top");
    },

    destroyed() {
        this.$html.removeClass("has-navbar-fixed-top");
    },

    mounted() {
        const $el = $(this.$el);
        this.$burger = $el.find(".navbar-burger");
        this.$menu = $el.find(".navbar-menu");
        this.menuToggle = () => {
            this.$burger.toggleClass("is-active");
            this.$menu.toggleClass("is-active");
        };

        this.$burger.on("click", this.menuToggle);

        this.$dropdowns = $el.find(".has-dropdown");
        this.dropdownToggle = function() {
            $(this).toggleClass("is-active");
        };
        this.$dropdowns.on("click", this.dropdownToggle);
    },

    beforeDestroy() {
        this.$dropdowns.off("click", this.dropdownToggle);
        this.$burger.off("click", this.menuToggle);
    }
};