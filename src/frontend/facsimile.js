const $ = require("jquery");
const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

const facsimiles = require("../facsimiles.json");

module.exports = () => {
    const [ element ] = $(".facsimile");
    const tileSources = facsimiles.map(
        id => `https://assets.pagina-dh.de/iiif/parzival-${id}.ptif/info.json`
    );
    const osd = OpenSeadragon({
        prefixUrl, element, tileSources,
        sequenceModex: true,
        showNavigator: true,
        showRotationControl: true,
        debugMode: false
    });

    osd.addHandler("open", () => osd.viewport.fitBoundsWithConstraints(
        new OpenSeadragon.Rect(0, 0, 1, 0.5)
    ));

    return Promise.resolve(osd);
};
