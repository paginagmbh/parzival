const { mapMutations } = require("vuex");

module.exports = {
    methods: {
        ...mapMutations({ "viewUpdate": "update" }),

        updateView() {
            const { name, params } = this.$route;
            this.viewUpdate({ view: name, ...params });
        }
    },

    watch: {
        "$route"() {
            this.updateView();
        }
    },

    created() {
        this.updateView();
    }
};