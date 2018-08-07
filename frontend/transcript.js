const { mapActions, mapGetters } = require("vuex");

module.exports = {
    name: "transcript",
    mixins: [require("./routing"), require("./routing-view")],

    template: require("./transcript.pug")(),
    components: {
        Navbar: require("./navbar"),
        Navigation: require("./navigation"),
        FacsimileViewer: require("./facsimile-viewer")
    },

    computed: {
        ...mapGetters("metadata", [
            "manuscript", "headings",
            "pageTitle", "verseTitle", "page"
        ]),
        ...mapGetters("text", ["columns"]),

        available() {
            const { columns } = this;
            for (const column in columns) {
                if (columns[column].verses.length > 0) {
                    return true;
                }
            }
            return false;
        },

        transcript() {
            return this.page.map(page => {
                return [page + "a", page + "b"].map(column => {
                    const contents = [];
                    if (column in this.columns) {
                        for (const verse of this.columns[column].verses) {
                            let headings = (this.headings[column] || {});
                            if (verse.verse in headings) {
                                contents.push({
                                    type: "heading",
                                    heading: headings[verse.verse]
                                });
                            }
                            contents.push({ type: "verse", ...verse });
                        }
                    }
                    return contents;
                });
            });
        }
    },

    methods: {
        heading(column, { verse }) {
            return (this.headings[column] || {})[verse] || [];
        }
    }

};