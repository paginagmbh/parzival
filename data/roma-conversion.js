const path = require("path");

const fs = require("fs");

const { stdout } = process;

const csv = require("csv-stringify/lib/sync");

const encoding = "utf-8";

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

data = csv(data, { columns: ["manuscript", "leaf", "page", "column", "start", "end", "hand" ] });

fs.writeFileSync(
    path.join(__dirname, "roma_verses.csv"),
    data,
    { encoding }
);

//stdout.write(Buffer.from(data));