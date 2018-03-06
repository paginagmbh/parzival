const { assign } = Object;

const equal = require("deep-equal");
const VueRouter = require("vue-router");

const Facsimile = require("./facsimile");
const Placeholder = require("./placeholder");

const routes = [
    { name: "home", path: "/", redirect: "/facsimile/V/001r/double-page" },
    { name: "_facsimile",
      path: "/facsimile/:sigil/:page",
      redirect: "/facsimile/:sigil/:page/double-page" },
    { name: "facsimile", path: "/facsimile/:sigil/:page/:mode", component: Facsimile },
    { name: "about", path: "/about", component: Placeholder },
    { name: "manuscripts", path: "/manuscripts", component: Placeholder },
    { name: "materials", path: "/materials", component: Placeholder },
    { name: "help", path: "/help", component: Placeholder },
    { name: "default", path: "*", redirect: "/" }
];

const router = module.exports = new VueRouter({ routes, mode: "history" });

let facsimileParams = { mode: "double-page" };
router.beforeEach(({ name, params }, from, next) => {
    switch (name) {
    case "facsimile":
        if (equal(params, facsimileParams)) {
            next();
        } else {
            params = facsimileParams = assign(facsimileParams, params);
            next({ name, params });
        }
        break;
    default:
        next();
    }
});
