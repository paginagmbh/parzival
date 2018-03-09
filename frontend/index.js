const $ = require("jquery");

const Vue = require("vue");
const Vuex = require("vuex");
const VueRouter = require("vue-router");

const { sync } = require("vuex-router-sync");

Vue.use(Vuex);
Vue.use(VueRouter);

const store = require("./store");
const router = require("./router");

sync(store, router);

const [ el ] = $(".parzival-app");

const template = require("./index.pug")();

const components = {
    Navbar: require("./navbar")
};

window.parzivalApp = new Vue({
    el, template,  components, store, router,

    name: "parzival",

    mounted() {
        $("html").removeClass("setting-up");
    }
});