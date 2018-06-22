import sax from "sax";

export function events(stream, saxOpts={ xmlns: true }) {
    return new Promise((resolve, reject) => {
        const saxStream = sax.createStream(true, saxOpts);
        const elements = [];
        const events = [];
        saxStream.on("opentag", (el) => {
            elements.unshift(el);
            events.push({ event: "start", ...el });
        });
        saxStream.on("closetag", () => {
            events.push({ event: "end", ...elements.shift() });
        });

        const text = (text) => events.push({event: "text", text });

        saxStream.on("text", text);
        saxStream.on("cdata", text);

        saxStream.on("error", reject);
        saxStream.on("end", () => resolve(events));

        stream.pipe(saxStream).on("error", reject);
    });
}

function eventType(type, pred=(() => true)) {
    return (event) => event.event == type && pred(event);
}

function element(pred) {
    return (event) => {
        switch (event.event) {
        case "start":
        case "end":
            return pred(event);
        default:
            return false;
        }
    };
}

export const filters = {
    element,

    start(pred) {
        return eventType("start", pred);
    },

    end(pred) {
        return eventType("end", pred);
    },

    text(pred) {
        return eventType("text", pred);
    },

    not(pred) {
        return (event) => !pred(event);
    },

    emptyText() {
        return eventType("text", ({ text }) => text.length == 0);
    },

    ns(...namespaces) {
        const idx = namespaces.reduce((idx, ns) => ({...idx, [ns]: true}), {});
        return element(({ uri }) => idx[uri] === true);
    },

    ln(...localNames) {
        const idx = localNames.reduce((idx, ln) => ({...idx, [ln]: true}), {});
        return element(({ local }) => idx[local] === true);
    },

    contextual(exclude, include, ctxStart, ctxEnd) {
        ctxStart = ctxStart || eventType("start");
        ctxEnd = ctxEnd || eventType("end");

        const context = [];
        return (event) => {
            if (ctxStart(event)) {
                const parent = context.length == 0 || context[0];
                context.unshift(parent ? !exclude(event) : include(event));
            }

            const accept = context.length == 0 || context[0];

            if (ctxEnd(event) && context.length > 0) {
                context.shift();
            }

            return accept;
        };
    }
};

function ws(str) {
    return str.match(/\s+/);
}

export const whitespace = {

    xmlSpace(event) {
        if (event.event == "start") {
            const xmlSpace = ["attributes", "xml:space", "value"].reduce(
                (obj, key) => obj ? obj[key] : undefined,
                event
            );
            return xmlSpace === undefined
                ? undefined
                : xmlSpace.toLowerCase() == "preserve";
        }
        return undefined;
    },

    compress(container, preserve) {
        const containers = [];
        const preserved = [false];
        let lastChar = " ";

        return (event) => {
            switch (event.event) {
            case "start": {
                containers.unshift(container(event));

                const pre = preserve(event);
                preserved.unshift(pre === undefined ? preserved[0] : pre);
                break;
            }
            case "end":
                containers.shift();
                preserved.shift();
                break;
            case "text": {
                const pre = preserved[0];
                let compressed = "";
                for (let char of event.text) {
                    if (!pre && ws(char) && ws(lastChar) || containers[0]) {
                        continue;
                    }
                    if (char == "\n" || char == "\r") {
                        char = " ";
                    }
                    compressed += (lastChar = char);
                }
                return { event: "text", text: compressed };
            }
            }
            return event;
        };
    },

    breakLines(lineBreak, charSeq="\n") {
        let start = true;
        let breaks = 0;

        return (event) => {
            if (!start && lineBreak(event)) {
                breaks++;
            }

            if (event.event == "text") {
                if (event.text.trim().length == 0) {
                    return event;
                }

                if (!start && breaks > 0) {
                    event = {
                        event: "text",
                        text: Array.from(new Array(breaks), () => charSeq)
                            .join("") + event.text
                    };
                    breaks = 0;
                }

                start = false;
            }

            return event;
        };
    }
};

const prefix = { "start": "<", "end": ">", text: "." };

export function stringify(event) {
    let value;
    switch (event.event) {
    case "start":
    case "end":
        value = { name: event.name, attributes: event.attributes };
        break;
    case "text":
        value = event.text;
        break;
    }
    return [prefix[event.event], JSON.stringify(value)].join(" ");
}

export default { events, filters, whitespace, stringify };