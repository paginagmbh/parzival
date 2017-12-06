const $ = require("jquery");
const OpenSeadragon = require("openseadragon");
const prefixUrl = "/openseadragon/images/";

module.exports = () => {
    const [ element ] = $(".facsimile");
    const tileSources = "https://assets.pagina-dh.de/iiif/parzival_v001r.ptif/info.json";
    const osd = OpenSeadragon({
        prefixUrl, element, tileSources,
        showNavigator: true,
        showRotationControl: true,
        debugMode: false
    });

    osd.addHandler("open", () => osd.viewport.fitBoundsWithConstraints(
        new OpenSeadragon.Rect(0, 0, 1, 0.5)
    ));

    return Promise.resolve(osd);
};
