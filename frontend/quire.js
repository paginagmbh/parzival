const { mapGetters, mapState } = require("vuex");

module.exports = {
    name: "quire",
    template: `<figure class="image parzival-quire-view" v-if="quireIconPath"><img :src="quireIconPath"></figure>`,

    computed: {
        ...mapState(["mode"]),
        ...mapGetters("metadata", ["manuscript", "page"]),

        quireIcon() {
            const { manuscript, page, mode } = this;
            const { quires } = manuscript;
            const [ icons ] = page.filter(p => p).map(p => quires[p]);
            if (!icons) {
                return undefined;
            }
            const { singlePage, doublePage } = icons;
            switch (mode) {
            case "double-page":
                return doublePage;
            default:
                return singlePage;
            }
        },

        quireIconPath() {
            const { quireIcon } = this;
            return quireIcon ? `/quire-icons/${quireIcon}.gif` : quireIcon;
        }
    }
};