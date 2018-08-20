const { transcript, collation } = window.parzival;

module.exports = {
    namespaced: true,

    getters: {
        pages(state, getters, { manuscript }) {
            return transcript[manuscript];
        },

        columns(state, getters, { manuscript }, rootGetters) {
            return rootGetters["metadata/page"]
                .map(p => p === undefined ? [] : ["a", "b"].map(c => `${p}${c}`))
                .reduce((columns, page) => page.reduce(
                    (columns, column) => ({
                        ...columns,
                        [column]: transcript[manuscript][column]
                    }),
                    columns
                ), {});
        }
    }
};