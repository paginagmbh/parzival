const { mapGetters } = require("vuex");

module.exports = {
    name: "quire",
    template: `<figure class="image parzival-quire-view" v-if="quireIconPath"><img :src="quireIconPath"></figure>`,

    computed: mapGetters("metadata", ["quireIconPath"])
};