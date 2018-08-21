const Vue = require("vue");
const VueRouter = require("vue-router");
const MQ = require("vue-match-media");
const VueLazyload = require("vue-lazyload");
const VueWaypoint = require("vue-waypoint").default;
const { focus } = require("vue-focus");

Vue.use(VueRouter);
Vue.use(MQ);
Vue.use(VueLazyload);
Vue.use(VueWaypoint);

Vue.directive("focus", focus);

window.parzivalApp = new Vue({
    name: "parzival",

    el: document.querySelector(".parzival-app"),
    template: require("./index.pug")(),

    router: require("./router"),

    data: {
        title: "Nuwer Parzifal"
    },

    mq: {
        mobile: "(max-width: 768px)",
        tablet: "(min-width: 769px)",
        touch: "(max-width: 1087px)",
        desktop: "(min-width: 1088px)",
        widescreen: "(min-width: 1280px)",
        fullhd: "(min-width: 1472px)"
    },

    watch: {
        title() {
            this.updateTitle();
        }
    },

    mounted() {
        this.updateTitle();
    },

    methods: {
        updateTitle() {
            document.title = this.title;
        }
    }
});
