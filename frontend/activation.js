module.exports = {
    methods: {
        active(flag) {
            return { "is-active": this[flag] };
        },

        toggle(flag) {
            return this[flag] = !this[flag];
        }
    }
};