const $ = require("jquery");
const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

const { TOP_LEFT, BOTTOM_RIGHT } = OpenSeadragon.ControlAnchor;

const facsimiles = require("../facsimiles.json");

function randomFacsimiles(size=10) {
    const { length } = facsimiles;
    const { floor, random } = Math;
    const offset = floor(random() * (length - size));
    return facsimiles.slice(offset, offset + size);
}

module.exports = () => {
    const [ element ] = $(".facsimile");
    const facsimiles = randomFacsimiles();
    const tileSources = facsimiles.map(
        id => `https://assets.pagina-dh.de/iiif/parzival-${id}.ptif/info.json`
    );
    const osd = OpenSeadragon({
        prefixUrl, element, tileSources,
        sequenceMode: true,
        showNavigator: true,
        showRotationControl: true,
        debugMode: false
    });

    const $pageLabel = $("<div></div").addClass("page-label");
    const [ pageLabelElement ] = $pageLabel;
    osd.addControl(pageLabelElement, { anchor: BOTTOM_RIGHT });

    osd.addHandler("open", (e) => {
        osd.viewport.fitBoundsWithConstraints(
            new OpenSeadragon.Rect(0, 0, 1, 0.5)
        );

        const { source } = e;
        const page = tileSources.indexOf(source);
        const facsimile = facsimiles[page];
        $pageLabel.text([page + 1, facsimile.toUpperCase()].join(".) "));
});

    return Promise.resolve(osd);
};
