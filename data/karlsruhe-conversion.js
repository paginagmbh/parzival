const path = require("path");

const fs = require("fs");

const { stdout } = process;

const csv = require("csv-stringify/lib/sync");

const encoding = "utf-8";

const manuscript = "K";

let verses = fs.readFileSync(
    path.join(__dirname, "konkkarls_np.txt"),
    { encoding }
).split(/[\n\r]+/);

verses = verses.slice(1).map(l => {
    let [leaf, page, column, , verse] = l.split(/;/);

    [ leaf, verse ] = [ leaf, verse ].map(n => parseInt(n, 10));

    const start = verse;
    const end = verse;

    return { leaf, page, column, start, end };
});

verses = verses.reduce((ranges, verse) => {
    const [ last ] = ranges;

    if (!last) {
        ranges.unshift(verse);
        return ranges;
    }

    if (["leaf", "page", "column"].some(p => last[p] != verse[p])) {
        ranges.unshift(verse);
        return ranges;
    }

    if ((last.end + 1) >= verse.start) {
        last.end = verse.end;
        return ranges;
    }

    ranges.unshift(verse);
    return ranges;
}, []).reverse();

verses = verses.filter(v => v.leaf >= 281 && v.leaf <= 301);

verses = verses.map(v => `Bl. ${"" + v.leaf + v.page + v.column}: NP ${v.start} - NP ${v.end}`);

stdout.write(Buffer.from(verses.join("\n")));

/*

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
*/
//stdout.write(Buffer.from(data));