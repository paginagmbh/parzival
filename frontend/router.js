const VueRouter = require("vue-router");

const routes = [
    { path: "/", name: "home",
      component: require("./home") },

    { path: "/:manuscript/:pages/overview", name: "overview",
      component: require("./overview"), props: true },

    { path: "/:manuscript/:pages/facsimile", name: "facsimile",
      component: require("./facsimile"), props: true },

    { path: "/:manuscript/:pages/transcript", name: "transcript",
      component: require("./transcript"), props: true },

    { path: "/introduction", name: "introduction",
      component: require("./introduction") },

    { path: "*", name: "default",
      redirect: "/" }
];

module.exports = new VueRouter({
    routes,
    mode: "history",
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
          } else {
            return { x: 0, y: 0 }
          }
    }
 });