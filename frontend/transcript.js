const { headings } = window.parzival.metadata;
const { transcript } = window.parzival.transcript;

module.exports = {
    name: "transcript",
    props: ["manuscript", "pages"],

    mixins: [require("./manuscript-location")],

    components: {
        Container: require("./container"),
        FacsimileViewer: require("./facsimile-viewer")
    },
    template: require("./transcript.pug")(),

    computed: {
        transcript() {
            const { manuscript, pageList } = this;
            const columns = pageList.reduce((columns, page) => {
                if (page) {
                    for (let column of ["a", "b"]) {
                        column = `${page}${column}`;
                        if (column in transcript[manuscript]) {
                            columns.push(column);
                        }
                    }
                }
                return columns;
            }, []);
            return columns.map(column => {
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
        },

        classes() {
            return {
                orientation: { "is-vertical": this.$mq.touch },
                transcript: { "is-4": this.$mq.desktop }
            };
        }
    }
};