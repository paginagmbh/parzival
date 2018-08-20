const VueRouter = require("vue-router");

const Placeholder = require("./placeholder");

const routes = [
    { path: "/", name: "home",
      redirect: "/V/114v,115r/facsimile" },

    { path: "/about", name: "about",
      component: Placeholder },
    { path: "/manuscripts", name: "manuscripts",
      component: Placeholder },
    { path: "/materials", name: "materials",
      component: Placeholder },
    { path: "/help", name: "help",
      component: Placeholder },

    { path: "/:manuscript/:pages/overview", name: "overview",
      component: require("./overview"), props: true },

    { path: "/:manuscript/:pages/facsimile", name: "facsimile",
      component: require("./facsimile"), props: true },

    { path: "/:manuscript/:pages/transcript", name: "transcript",
      component: require("./transcript"), props: true },

    { path: "*", name: "default",
      redirect: "/" }
];

module.exports = new VueRouter({ routes, mode: "history" });