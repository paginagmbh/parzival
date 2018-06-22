import path from "path";
import fs from "fs";

import globby from "globby";
import escape from "escape-html";

import m from "../lib/manuscript";
import v from "../lib/verse";
import markup from "../lib/markup";

function sort(a, b) {
    let diff = a.manuscript.localeCompare(b.manuscript);
    return diff == 0 ? a.num - b.num : diff;
}

function xmlId(el) {
    return el.attributes["xml:id"].value.replace(/[^_]+_NEU/i, "");
}

function verseSigil(el) {
    const sigil = xmlId(el).replace(/^_+/, "");

    let components = sigil.split("-");
    let { nums, plus } = v.parse(components.shift());
    components = components.map(c => parseInt(c, 10) || c);

    if (nums.length == 2 && nums[0] == 733 && nums[1] >= 100000) {
        nums = [ nums[1] - 100000 ];
    }
    plus = components.filter(c => !isNaN(c));

    let variant = components.filter(c => isNaN(c));
    variant = variant.length == 0 ? undefined : variant;

    return { nums, plus, variant };
}

function breakSigil(el) {
    return m.parsePageSigil(xmlId(el));
}

const { start, ln, emptyText, not, contextual } = markup.filters;

async function parse({ source, manuscript, text }, index=0) {
    return (await markup.events(fs.createReadStream(source)))
        .filter(contextual(
            start(ln("TEI", "del", "choice")),
            start(ln("text", "reg", "corr", "ex"))
        ))
        .filter(contextual(
            start(ln("note", "text")),
            start(ln("l", "cb"))
        ))
        .map(markup.whitespace.compress(
            () => false,
            markup.whitespace.xmlSpace
        ))
        .map(markup.whitespace.breakLines(
            start(ln("l", "cb")),
            index == 0
        ))
        .filter(not(emptyText()))
        .map(event => {
            switch (event.event) {
            case "start":
                switch (event.local) {
                case "pb":
                case "cb":
                    event = { ...event, ...breakSigil(event), manuscript };
                    break;
                case "l":
                    event = { ...event, ...verseSigil(event), text };
                    break;
                }
            }
            return event;
        });
}

function columns(transcript) {
    let verse = false;
    return transcript.reduce(
        (columns, event) => {
            if (event.event == "start") {
                switch (event.local) {
                case "cb": {
                    const { manuscript } = event;
                    const column = m.columnSigil(event);
                    const [current] = columns;
                    if (!current || current.column != column) {
                        columns.unshift({ manuscript, column, contents: [] });
                    }
                    break;
                }
                case "l":
                    verse = true;
                    break;
                }
            }
            if (verse && columns.length >  0) {
                columns[0].contents.push(event);
            }
            if (event.event == "end" && event.local == "l") {
                verse = false;
            }
            return columns;
        },
        []
    ).reverse();
}

function hi(event) {
    if (event.event == "end") {
        return "</span>";
    }
    const rend = (event.attributes["rend"] || {})["value"] || "";
    const classes = [];
    if (rend == "rot") {
        classes.push("hi-red");
    }
    if (rend.includes("Fleuronee")) {
        classes.push("hi-fleuronee");
    }
    if (rend.includes("Lombarde")) {
        classes.push("hi-lombarde");
    }
    return `<span class="${classes.join(" ")}" data-rend="${rend}">`;
}

function verses(columns) {
    return columns.map(column => {
        const { contents } =  column;
        const verses = contents.reduce((verses, event) => {
            if (event.event == "start" && event.local == "l") {
                verses.unshift({ verse: v.toString(event), html: "" });
                return verses;
            }

            const [ current ] = verses;
            if (!current) {
                return verses;
            }

            if (event.event == "text") {
                current.html += escape(event.text.replace(/\n/g, ""));
                return verses;
            }

            switch (event.local) {
            case "hi":
                current.html += hi(event);
                break;
            }

            return verses;
        }, []).reverse();

        column = { ...column, verses };
        delete column.contents;
        return column;
    });
}
export default async function toHtml(cwd) {
    const sources = (await globby("**/*.xml", { cwd }))
          .map(f => {
              const source = path.resolve(cwd, f);

              const basename = path.basename(f, "_neu.xml");
              let [,manuscript, text, num] = basename.match(/(v{1,2})(n?p)([0-9])+/);

              manuscript = manuscript.toUpperCase();
              text = text.toUpperCase();
              num = parseInt(num, 10);

              return { source, manuscript, text, num };
          })
          .sort(sort)
    ;

    const transcript = (await Promise.all(sources.map(parse)))
          .reduce((all, one) => all.concat(one), []);

    return verses(columns(transcript));
}