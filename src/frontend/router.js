const VueRouter = require("vue-router");

const Facsimile = require("./facsimile");
const Placeholder = require("./placeholder");

const routes = [
    { name: "home", path: "/", redirect: "/facsimile/V/001r" },
    { name: "facsimile", path: "/facsimile/:sigil/:page", component: Facsimile },
    { name: "about", path: "/about", component: Placeholder },
    { name: "manuscripts", path: "/manuscripts", component: Placeholder },
    { name: "materials", path: "/materials", component: Placeholder },
    { name: "help", path: "/help", component: Placeholder },
    { name: "default", path: "*", redirect: "/" }
];

module.exports = new VueRouter({ routes, mode: "history" });
