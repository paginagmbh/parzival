const $ = require("jquery");

const Vue = require("vue");
const Vuex = require("vuex");
const VueRouter = require("vue-router");

Vue.use(Vuex);
Vue.use(VueRouter);

const modules = {
    facsimiles: require("./frontend/state/facsimile")
};

const store = new Vuex.Store({
    modules
});

const routes = [
    { path: "*", component: require("./frontend/facsimile") }
];

const router = new VueRouter({ routes });

const [ el ] = $(".parzival-app");

const template = require("./frontend.pug")();

const components = {
    Navbar: require("./frontend/navbar")
};

window.parzivalApp = new Vue({
    el, template,  components, store, router,

    mounted() {
        $("html").removeClass("setting-up");
    }
});