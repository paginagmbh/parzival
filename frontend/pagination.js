module.exports = {
    name: "pagination",
    props: ["manuscript", "pages"],

    mixins: [require("./manuscript-location")],
    template: require("./pagination.pug")()
};