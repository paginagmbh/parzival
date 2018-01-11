const { assign } = Object;

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

const verseSets = [
    verses.filter(v => v.manuscript == "K" && v.start.nums.length == 1),
    verses.filter(v => v.manuscript == "K" && v.start.nums.length == 2),
    verses.filter(v => v.manuscript == "R" && v.start.nums.length == 1),
    verses.filter(v => v.manuscript == "R" && v.start.nums.length == 2)
].map(verses => verses.sort(
    (a, b) => verse.compare(a.start, b.start) || verse.compare(a.end, b.end)
));

function toString(v) {
    return [
        "<", v.manuscript, v.leaf, v.page, v.column, " ",
        verse.toString(v.start), " - ", verse.toString(v.end), ">"
    ].join("");
}

verseSets.forEach(m => {
    m.reduce((all, one) => {
        const [ last ] = all;
        if (last && verse.compare(last.end, one.start) >= 0) {
            process.stdout.write([ toString(last), toString(one) ].join(" >!< ") + "\n");
        }
        all.unshift(one);
        return all;
    }, []);
});

//process.stdout.write(JSON.stringify(verses));