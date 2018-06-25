const Vue = require("vue");

const VueLazyload = require("vue-lazyload");
const { focus } = require("vue-focus");

const Vuex = require("vuex");
const VueRouter = require("vue-router");
const { sync } = require("vuex-router-sync");

Vue.use(VueLazyload);
Vue.use(Vuex);
Vue.use(VueRouter);

Vue.directive("focus", focus);

const store = require("./store");
const router = require("./router");

sync(store, router);

const name = "parzival";
const el = document.querySelector(".parzival-app");

const template = require("./index.pug")();

const components = {
    Navbar: require("./navbar")
};

(async () => {
    window.transcript = await (await fetch(
        "/transcript.json", { credentials: "same-origin" }
    )).json();

    window.parzivalApp = new Vue({
        name, el, template,  components, store, router
    });
})();
