const { mapMutations } = require("vuex");

module.exports = {
    methods: {
        ...mapMutations({ "viewUpdate": "update" }),

        updateView() {
            const { name, params } = this.$route;
            this.viewUpdate({ mode: name, ...params });
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