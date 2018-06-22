import path from "path";
import fs from "fs";

import globby from "globby";

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

async function parse({ source, manuscript, text }) {
    return (await markup.events(fs.createReadStream(source)))
        .filter(contextual(
            start(ln("TEI", "del", "choice")),
            start(ln("text", "reg", "corr", "ex"))
        ))
        .filter(contextual(
            start(ln("note")),
            () => false
        ))
        .map(markup.whitespace.compress(
            start(ln("div", "subst", "choice")),
            markup.whitespace.xmlSpace
        ))
        .map(markup.whitespace.breakLines(
            start(ln("l", "cb"))
        ))
        .filter(not(emptyText()))
        .map(event => {
            switch (event.event) {
            case "start":
                switch (event.local) {
                case "pb":
                case "cb":
                    event = { ...event, ...breakSigil(event), manuscript, text };
                    break;
                case "l":
                    event = { ...event, ...verseSigil(event), manuscript, text };
                    break;
                }
            }
            return event;
        });
}

export async function toHtml(cwd) {
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

    console.log(
        transcript
            .filter(markup.filters.text())
            .map(({ text }) => text)
            .join("")
    );
}