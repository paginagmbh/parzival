function source(page) {
    return "/transcript.json";
}

module.exports = {
    namespaced: true,

    state: {
        transcript: null
    },

    getters: {
        columns(state, getters, rootState, rootGetters) {
            const { manuscript } = rootState;
            const pages = (state.transcript || {})[manuscript] || {};

            return rootGetters["metadata/page"].map(p => {
                if (p === undefined) {
                    return [];
                }
                return (pages[p] || []).reduce((all, one) => all.concat(one), []);
            }).reduce((columns, page) => page.reduce(
                (columns, column) => ({ ...columns, [column.column]: column }),
                columns
            ), {});
        }
    },

    mutations: {
        merge(state, { sources }) {
            state.transcript = sources.reduce((transcript, source) => Object.assign(
                transcript, { ...source }
            ), state.transcript || {});
        }
    },

    actions: {
        async load({ commit, state, rootState, rootGetters }) {
            const { manuscript } = rootState;
            const page = rootGetters["metadata/page"].filter(p => p);
            const { transcript } = state;

            const loaded = (transcript || {})[manuscript] || {};
            let sources = Object.keys(
                page.filter(p => !(p in loaded)).map(source).reduce(
                    (sources, source) => ({ ...sources, [source]: true }),
                    {}
                )
            ).sort();

            sources = await Promise.all(sources.map(
                source => fetch(source, { credentials: "same-origin" })
                    .then(resp => resp.json())
            ));

            commit("merge", { sources });
        }
    }
};