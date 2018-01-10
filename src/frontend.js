const $ = require("jquery");

const Vue = require("vue");
const Vuex = require("vuex");
const VueRouter = require("vue-router");

const { sync } = require("vuex-router-sync");

Vue.use(Vuex);
Vue.use(VueRouter);

const modules = {
    facsimiles: require("./frontend/state/facsimile")
};

const store = new Vuex.Store({
    modules
});

const Facsimile = require("./frontend/facsimile");
const Placeholder = require("./frontend/placeholder");

const routes = [
    { name: "home", path: "/", redirect: "/facsimile/1" },
    { name: "facsimile", path: "/facsimile/:position", component: Facsimile },
    { name: "about", path: "/about", component: Placeholder },
    { name: "manuscripts", path: "/manuscripts", component: Placeholder },
    { name: "materials", path: "/materials", component: Placeholder },
    { name: "help", path: "/help", component: Placeholder },
    { name: "default", path: "*", redirect: "/" }
];

const router = new VueRouter({ routes });

sync(store, router);

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