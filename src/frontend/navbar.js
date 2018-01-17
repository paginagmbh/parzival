const { assign } = Object;
const $ = require("jquery");

const { mapGetters } = require("vuex");

const computed = assign({

    otherManuscripts() {
        return this.metadata.filter(m => m.sigil != this.sigil);
    }

}, mapGetters("metadata", ["metadata", "sigil", "title"]));

module.exports = {
    template: require("./navbar.pug")(),

    computed,

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
    },

    beforeDestroy() {
        this.$burger.off("click", this.menuToggle);
    }
};