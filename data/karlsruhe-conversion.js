const path = require("path");

const fs = require("fs");

const csv = require("csv-stringify/lib/sync");

const encoding = "utf-8";

const manuscript = "K";

let data = fs.readFileSync(
    path.join(__dirname, "karlsruhe_verses.txt"),
    { encoding }
).split(/[\n\r]+/);

const hands = {
    "I": "K1",
    "II": "K2",
    "III": "K3",
    "IV": "K4",
    "V": "K5"
};
let hand = undefined;

data = data.map(l => {
    const handMatch = /Schreiber ([IV]+):/.exec(l);
    if (handMatch) {
        const [ , sigle ] = handMatch;
        hand = hands[sigle];
        return undefined;
    }
    const match = /Bl\. (\d+)([rv])([ab]): (?:NP )?([0-9.[\]]+) - (?:NP )?([0-9.[\]]+)/.exec(l);
    if (!match) {
        return undefined;
    }
    let [, leaf, page, column, start, end ] = match;

    return { manuscript, leaf, page, column, start, end, hand };
});

data = data.filter(l => l);

data = csv(data, { columns: ["manuscript", "leaf", "page", "column", "start", "end", "hand" ] });

fs.writeFileSync(
    path.join(__dirname, "karlsruhe_verses.csv"),
    data,
    { encoding }
);