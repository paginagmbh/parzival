const VueRouter = require("vue-router");

const Facsimile = require("./facsimile");
const Overview = require("./overview");
const Placeholder = require("./placeholder");
const Text = require("./text");

const routes = [
    { path: "/", name: "home",
      redirect: "/V/114v/double-page" },

    { path: "/about", name: "about",
      component: Placeholder },
    { path: "/manuscripts", name: "manuscripts",
      component: Placeholder },
    { path: "/materials", name: "materials",
      component: Placeholder },
    { path: "/help", name: "help",
      component: Placeholder },

    { path: "/:manuscript/:page", name: "page",
      redirect: "/:manuscript/:page/double-page"},

    { path: "/:manuscript/:page/overview", name: "overview",
      component: Overview },

    { path: "/:manuscript/:page/double-page", name: "double-page",
      component: Facsimile },

    { path: "/:manuscript/:page/single-page", name: "single-page",
      component: Facsimile },

    { path: "/:manuscript/:page/text", name: "text",
      component: Text },

    { path: "*", name: "default",
      redirect: "/" }
];

module.exports = new VueRouter({ routes, mode: "history" });