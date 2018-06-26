const Vue = require("vue");

const VueLazyload = require("vue-lazyload");
const { focus } = require("vue-focus");

const Vuex = require("vuex");
const { mapGetters } = Vuex;

const VueRouter = require("vue-router");
const { sync } = require("vuex-router-sync");

Vue.use(VueLazyload);
Vue.use(Vuex);
Vue.use(VueRouter);

Vue.directive("focus", focus);

const store = require("./store");
const router = require("./router");

sync(store, router);

window.parzivalApp = new Vue({
    name: "parzival",

    el: document.querySelector(".parzival-app"),
    template: require("./index.pug")(),

    store, router,

    computed: mapGetters("metadata", ["manuscript", "pageTitle"]),

    watch: {
        manuscript() {
            this.updateTitle();
        },

        pageTitle() {
            this.updateTitle();
        }
    },

    mounted() {
        this.updateTitle();
    },

    methods: {
        updateTitle() {
            const { manuscript, pageTitle } = this;
            const { title, sigil } = manuscript;
            document.title = `Nuwer Parzifal – ${title} (${sigil}) – ${pageTitle}`;
        }
    }
});
