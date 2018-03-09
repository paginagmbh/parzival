const $ = require("jquery");
const d3 = require("d3");

module.exports = {
    name: "quire",
    template: `<svg class="parzival-quire-view"></svg>`,

    mounted() {
        let $el = $(this.$el);

        let view = d3.select(this.$el);
        view.select("g").remove();

        let [width, height] = [$el.width(), $el.height()];
        if (width == 0 ||  height == 0) {
            return;
        }
        const margin = Math.max(10, Math.min(width, height) * 0.1);

        width = width - 2 * margin;
        height = height - 2 * margin;

        view = view.append("g")
            .attr("transform", `translate(${margin}, ${margin})`);

        const quires = view.selectAll("g")
              .data([0, 1, 2]);

        const quire = quires.enter().append("g");

        quire.append("path")
            .attr("d", (i) => {
                const d = 10;
                const cx = width / 2;
                const cy = (height - 15) / 2 + 7 * i;

                const p = d3.path();
                p.moveTo(d, cy + d);
                p.lineTo(cx - d, cy + d);
                p.bezierCurveTo(
                    cx, cy + d,
                    cx, cy,
                    cx + d, cy - d
                );
                p.lineTo(width - d, cy - d);

                return p.toString();
            })
            .classed("parzival-quire", true)
            .classed("is-active", d => d == 0);

    }
};