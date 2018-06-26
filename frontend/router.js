const VueRouter = require("vue-router");

const Facsimile = require("./facsimile");
const Placeholder = require("./placeholder");
const Overview = require("./overview");

const routes = [
    { path: "/", name: "home",
      redirect: "/V/001r/double-page/facsimile" },

    { path: "/about", name: "about",
      component: Placeholder },
    { path: "/manuscripts", name: "manuscripts",
      component: Placeholder },
    { path: "/materials", name: "materials",
      component: Placeholder },
    { path: "/help", name: "help",
      component: Placeholder },

    { path: "/:manuscript/:page", name: "_facsimile",
      redirect: "/:manuscript/:page/double-page/facsimile" },

    { path: "/:manuscript/:page/:mode/facsimile", name: "facsimile",
      component: Facsimile },

    { path: "/:manuscript/:page/:mode/overview", name: "overview",
      component: Overview },

    { path: "*", name: "default",
      redirect: "/" }
];

module.exports = new VueRouter({ routes, mode: "history" });