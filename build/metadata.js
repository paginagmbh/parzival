const { assign, keys } = Object;

const assert = require("assert");

const path = require("path");
const fs = require("fs");

const equal = require("deep-equal");

const csvParse = require("csv-parse/lib/sync");
const csvStringify = require("csv-stringify/lib/sync");

const verse = require("../lib/verse");
const { pageSigil, parsePageSigil, pageRange, pageSeq } = require("../lib/manuscript");
const quire = require("../lib/quire");

const encoding = "utf-8";

let quireTypes = fs.readdirSync(
    path.resolve(__dirname, "..", "frontend", "quire-icons")
);

quireTypes = quireTypes
    .filter(fn => fn.includes("p_"))
    .map(fn => fn.split("p_"))
    .reduce(
        (idx, [ type ]) => assign(
            idx, { [type]: (idx[type] || 0) + 1 }
        ),
        {}
    );

quireTypes = keys(quireTypes).reduce(
    (types, type) => {
        const count = quireTypes[type];
        const pages = pageSeq({ leaf: 1, page: "r" }, count);
        const leafs = quire.leafs(pages);
        return assign(types, { [type]: { count, pages, leafs } });
    },
    {}
);

let quires = csvParse(fs.readFileSync(
    path.join(__dirname, "quires.csv"),
    { encoding }
), { columns: ["manuscript", "pages", "quire"] });

quires = quires.filter(({ quire }) => quire);

quires = quires.map(manuscriptQuire => {
    const { manuscript } = manuscriptQuire;
    const type = manuscriptQuire.quire;

    const quireType = quireTypes[type];
    const { count, pages, leafs } = quireType;

    const manuscriptPages = pageRange(
        ...manuscriptQuire.pages.split("–").map(parsePageSigil)
    );
    const manuscriptLeafs = quire.leafs(manuscriptPages);

    assert.equal(
        manuscriptPages.length, count,
        JSON.stringify({ manuscriptPages, quireType })
    );

    const result = [];
    manuscriptPages.forEach((page, pi) => {
        result.push({
            manuscript,
            page: pageSigil(page),
            singlePage: `${type}p_${pageSigil(pages[pi], 1)}`,
            doublePage: manuscriptLeafs
                .map((l, li) => ({ l, li }))
                .filter(({ l }) => l.some(lp => equal(lp, page)))
                .map(({ li }) => leafs[li])
                .map(leaf => leaf.filter(p => p).map(p => pageSigil(p, 1)).join(""))
                .map(leaf => `${type}_${leaf}`)
                .shift()
        });
    });

    return result;
}).reduce((all, one) => all.concat(one), []);

function karlsruheData() {
    const manuscript = "K";

    let data = fs.readFileSync(
        path.join(__dirname, "verses_v.txt"),
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
        path.join(__dirname, "verses_vv.txt"),
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
    csvStringify(verses, {
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

    const pageQuires = pages.reduce(
        (all, one) => {
            const { singlePage, doublePage } = quires
                  .filter(({ manuscript, page }) => one == page && sigil == manuscript)
                  .shift() || {};

            return assign(all, { [one]: { singlePage, doublePage }});
        },
        {}
    );

    const p = columns.filter(c => verse.p(c.start)).sort(verseSort);
    const np = columns.filter(c => verse.np(c.start)).sort(verseSort);

    return assign({}, metadata[sigil], { columns, pages, quires: pageQuires, p, np });
});

fs.writeFileSync(
    path.resolve(__dirname, "..", "frontend", "store", "metadata.json"),
    JSON.stringify(manuscripts),
    { encoding }
);