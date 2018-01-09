const $ = require("jquery");

module.exports = {
    template: require("./navbar.pug")(),

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