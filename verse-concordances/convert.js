const { assign, keys } = Object;

const path = require("path");
const fs = require("fs");

const csv = require("csv-stringify/lib/sync");

const verse = require("../src/verse");
const { pageSigil } = require("../src/manuscript");

const encoding = "utf-8";

function karlsruheData() {
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

    return data;
}

function romaData() {
    const manuscript = "R";

    let data = fs.readFileSync(
        path.join(__dirname, "roma_verses.txt"),
        { encoding }
    ).split(/[\n\r]+/);

    data = data.map(l => {
        const match = /Bl\. (\d+)([rv])([ab]): ([0-9.[\]]+) – ([0-9.[\]]+)/.exec(l);
        if (!match) {
            return undefined;
        }
        let [, leaf, page, column, start, end ] = match;
        leaf = parseInt(leaf, 10);

        const hand = leaf <= 48 ? "R1" : "R2";

        return { manuscript, leaf, page, column, start, end, hand };
    });

    data = data.filter(l => l);

    return data;
}

let verses = karlsruheData().concat(romaData());

fs.writeFileSync(
    path.join(__dirname, "verses.csv"),
    csv(verses, {
        columns: ["manuscript", "leaf", "page", "column", "start", "end", "hand" ]
    }),
    { encoding }
);

verses = verses.map(v => {
    let { start, end } = v;
    [ start, end ] = [ start, end].map(verse.parse);
    if (verse.compare(start, end) > 0 || start.nums.length != end.nums.length) {
        throw new Error(JSON.stringify(v));
    }
    return assign({}, v, { start, end });
});

const verseSort = (a, b) => verse.compare(a.start, b.start) || verse.compare(a.end, b.end);

const metadata = {
    "K": {
        sigil: "V",
        title: "Karlsruhe, Bad. Landesbibl., Donaueschingen 97"
    },
    "R": {
        sigil: "VV",
        title: "Roma, Biblioteca Casanatense, Ms. 1409"
    }
}

const manuscripts = ["K", "R"].map(sigil => {
    const columns = verses
          .filter(v => v.manuscript == sigil)
          .map(v => { delete v.manuscript; return v; })
          .map(v => assign(v, { leaf: parseInt(v.leaf, 10) }));

    const pages = keys(columns.reduce(
        (pages, col) => assign(pages, { [pageSigil(col)]: true }),
        {}
    )).sort();

    const p = columns.filter(c => verse.p(c.start)).sort(verseSort);
    const np = columns.filter(c => verse.np(c.start)).sort(verseSort);

    return assign({}, metadata[sigil], { columns, pages, p, np });
});

fs.writeFileSync(
    path.resolve(__dirname, "..", "src", "metadata.json"),
    JSON.stringify(manuscripts),
    { encoding }
);