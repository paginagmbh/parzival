const VueRouter = require("vue-router");

const Overview = require("./overview");
const Page = require("./page");
const Placeholder = require("./placeholder");
const Transcript = require("./transcript");

const routes = [
    { path: "/", name: "home",
      redirect: "/V/115v/text" },

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
      component: Page },

    { path: "/:manuscript/:page/single-page", name: "single-page",
      component: Page },

    { path: "/:manuscript/:page/text", name: "text",
      component: Transcript },

    { path: "*", name: "default",
      redirect: "/" }
];

module.exports = new VueRouter({ routes, mode: "history" });