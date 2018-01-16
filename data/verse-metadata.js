const { assign, keys } = Object;

const path = require("path");
const fs = require("fs");

const csv = require("csv-parse/lib/sync");
const verse = require("../src/verse");

const encoding = "utf-8";

let verses = csv(
    fs.readFileSync(path.join(__dirname, "verses.csv"), { encoding }),
    { columns: ["manuscript", "leaf", "page", "column", "start", "end", "hand" ] }
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

function paddedLeaf(leaf) {
    if (leaf > 99) {
        return leaf.toString();
    } else if (leaf > 9) {
        return `0${leaf}`;
    } else {
        return `00${leaf}`;
    }
}

const manuscripts = ["K", "R"].map(sigil => {
    const columns = verses
          .filter(v => v.manuscript == sigil)
          .map(v => { delete v.manuscript; return v; })
          .map(v => assign(v, { leaf: parseInt(v.leaf, 10) }));

    const pages = keys(columns.reduce(
        (pages, col) => assign(pages, { [[
            paddedLeaf(col.leaf),
            col.page
        ].join("")]: true }),
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