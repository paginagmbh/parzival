const { headings } = window.parzival.metadata;

module.exports = {
    name: "transcript",
    mixins: [require("./manuscript-location")],

    props: ["manuscript", "pages"],

    template: require("./transcript.pug")(),

    components: {
        Navbar: require("./navbar"),
        Navigation: require("./navigation"),
        FacsimileViewer: require("./facsimile-viewer")
    },

    computed: {
        columns() {
            const { manuscript, page } = this;
            return [];
        },

        available() {
            const { columns } = this;
            for (const column in columns) {
                if (columns[column].length > 0) {
                    return true;
                }
            }
            return false;
        },

        transcript() {
            const { manuscript, columns } = this;

            const transcript = [];
            for (const column in columns) {
                const contents = [];
                for (const verse of columns[column]) {
                    const columnHeadings = (headings[manuscript][column] || {});
                    if (verse.verse in columnHeadings) {
                        contents.push({
                            type: "heading",
                            heading: columnHeadings[verse.verse]
                        });
                    }
                    contents.push({ type: "verse", ...verse });
                }
                transcript.push(contents);
            }
            return transcript;
        }
    },

    methods: {
        heading(column, { verse }) {
            return (this.headings[column] || {})[verse] || [];
        }
    }

};