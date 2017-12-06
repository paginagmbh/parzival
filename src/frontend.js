const $ = require("jquery");

const components = [
    require("./frontend/navbar"),
    require("./frontend/facsimile")
];

Promise.all(components.map(c => c()))
    .then(() => $("html").removeClass("setting-up"));
