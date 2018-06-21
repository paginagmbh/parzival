import path from "path";
import fs from "fs";

import globby from "globby";
import sax from "sax";

import m from "../lib/manuscript";
import v from "../lib/verse";

function sort(a, b) {
    let diff = a.manuscript.localeCompare(b.manuscript);
    return diff == 0 ? a.num - b.num : diff;
}

function parse(file, handler, data={}) {
    return new Promise((resolve, reject) => {
        const saxStream = sax.createStream(true, { xmlns: true });

        for (const event in handler) {
            if (sax.EVENTS.indexOf(event) >= 0) {
                saxStream.on(event, handler[event].bind(data));
            }
        }

        saxStream.on("error", reject);
        saxStream.on("end", () => resolve(data));

        fs.createReadStream(file).pipe(saxStream).on("error", reject);
    });
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

function textOfNode(node) {
    if (node.text) {
        return node.text;
    }

    let separator;

    switch (node.type) {
    case "l":
        separator = "";
        break;
    default:
        separator = "\n";
    }

    return node.contents.map(textOfNode).join(separator);
}

function mergeNodes(prev, next) {
    if (prev.type == "text" && next.type == "text") {
        return [{
            type: "text",
            contents: [],
            cdata: [prev.cdata, next.cdata].join("")
        }];
    }
    return [prev, next];
}

function compactNode(node) {
    node.contents = node.contents
        .map(compactNode)
        .reduce((contents, next) => {
            if (contents.length == 0) {
                contents.push(next);
                return contents;
            }
            const prev = contents.pop();
            mergeNodes(prev, next).forEach(result => contents.push(result));
            return contents;
        }, []);

    return node;
}

function traverse(root, callback) {
    const path = [];
    return (function traverse(node) {
        let result = [ callback(node, path) ];

        path.push(node);
        node.contents.forEach(child => {
            traverse(child, path).forEach(r => result.push(r));
        });
        path.pop();

        return result;
    })(root);
}

class Parser {

    constructor(manuscript, text) {
        this.stack = [];
        this.locator = { manuscript, text };
        this.model = [{ type: "model", attributes: {}, contents: [], text: "" }];
    }

    parse(file) {
        return new Promise((resolve, reject) => {
            const saxStream = sax.createStream(true, { xmlns: true });

            saxStream.on("opentag", this.opentag.bind(this));
            saxStream.on("closetag", this.closetag.bind(this));
            saxStream.on("text", this.cdata.bind(this));
            saxStream.on("cdata", this.cdata.bind(this));
            saxStream.on("error", reject);
            saxStream.on("end", () => resolve(compactNode(this.model.pop())));

            fs.createReadStream(file).pipe(saxStream).on("error", reject);
        });
    }

    opentag(el) {
        this.stack.unshift(el);

        const { local, uri, attributes } = el;
        switch (uri) {
        case "http://www.tei-c.org/ns/1.0":
            switch (local) {
            case "cb":
                Object.assign(this.locator, breakSigil(el));
                break;
            case "l":
                this.down(local, { ...attributes, ...verseSigil(el), ...this.locator });
                break;
            default:
                this.down(local, attributes);
                break;
            }
        }
    }

    closetag() {
        const { local, uri } = this.stack.shift();

        switch (uri) {
        case "http://www.tei-c.org/ns/1.0":
            switch (local) {
            case "cb":
                break;
            default:
                this.up();
                break;
            }
        }
    }

    cdata(cdata) {
        this.down("text", { cdata });
        return this.up();
    }

    down(type, attributes = {}, contents = []) {
        const node = { type, attributes, contents };

        const parent = this.model.pop();
        parent.contents.push(node);
        this.model.push(parent);

        this.model.push(node);
        return node;
    }

    up() {
        return this.model.pop();
    }
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
          .sort(sort);

    for (const { manuscript, text, source } of sources) {
        const model = await new Parser(manuscript, text).parse(source);
        console.log(JSON.stringify(model, null, 2));
    }

}