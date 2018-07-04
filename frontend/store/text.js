let transcript = {};

module.exports = {
    namespaced: true,

    state: {
        transcript: null
    },

    getters: {
        pages({ transcript }, getters, { manuscript }) {
            return (transcript || {})[manuscript] || {};
        },

        columns(state, { pages }, rootState, rootGetters) {
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
        merge(state, transcript) {
            Object.assign(state, { transcript });
        }
    },

    actions: {
        async load({ commit, state }) {
            let { transcript } = state;
            if (transcript) {
                return;
            }
            transcript = await fetch(
                "/transcript.json", { credentials: "same-origin" }
            ).then(resp => resp.json());

            commit("merge", transcript);
        }
    }
};