const { headings } = window.parzival.metadata;
const { transcript } = window.parzival.transcript;

module.exports = {
    name: "transcript",
    props: ["manuscript", "pages"],

    mixins: [require("./manuscript-location")],

    components: {
        Navbar: require("./navbar"),
        Navigation: require("./navigation"),
        FacsimileViewer: require("./facsimile-viewer")
    },
    template: require("./transcript.pug")(),

    computed: {
        classes() {
            return {
                orientation: { "is-vertical": this.$mq.touch },
                transcriptWidth: { "is-4": this.$mq.desktop }
            };
        },

        transcript() {
            const { manuscript, page } = this;
            return Object.keys(transcript[manuscript]).sort().map(column => {
                const columnHeadings = (headings[manuscript] || {})[column] || {};
                return {
                    column,
                    columnClass: column.endsWith("a") ? "is-primary" : "is-light",
                    page: column.replace(/[ab]$/, ""),
                    contents: transcript[manuscript][column].reduce(
                        (contents, verse) => {
                            const verseContents = [
                                { type: "verse", ...verse }
                            ];
                            if (verse.verse in columnHeadings) {
                                verseContents.unshift({
                                    type: "heading",
                                    heading: columnHeadings[verse.verse]
                                });
                            }
                            return contents.concat(verseContents);
                        },
                        []
                    )
                };
            });
        }
    },

    methods: {
        columnVisible({ direction, el, going }) {
            if (!direction || going != "in") {
                return;
            }
            const column = el.getAttribute("data-column");
            const page = column.replace(/[ab]$/, "");

            this.$router.replace(this.toPage(page));
        }
    },

    mounted() {
        const options = {
            root: this.$refs.pageContainer,
            rootMargin: "-15% 0% -65% 0%"
        };

        this.$refs.columns.forEach(el => {
            this.$addObserver(el, this.columnVisible.bind(this), options);
        });
  }
};