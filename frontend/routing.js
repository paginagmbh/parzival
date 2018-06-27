const { mapGetters } = require("vuex");

module.exports = {
    computed: mapGetters(["route"]),

    methods: {
        goto(newParams) {
            const { name, params } = this.route;
            return { name, params: {...params, ...newParams } };
        },

        gotoManuscript(manuscript) {
            return this.goto({ manuscript, page: "001r" });
        },

        gotoPage(page) {
            return this.goto({ page });
        },

        gotoMode(mode) {
            const { params } = this.route;
            return { name: mode , params};
        }
    }
};