const { isArray } = Array;

function pages(quire) {
    let pages = [];
    const queue = [ quire ];
    while (queue.length > 0) {
        const quire = queue.shift();
        for (let p = 0, l = quire.length; p < l; p++) {
            const current = quire[p];
            if (isArray(current)) {
                queue.unshift(quire.slice(p + 1));
                queue.unshift(current);
                break;
            }
            pages.push(current);
        }
    }
    return pages;
}

function doublePages(pages) {
    pages = [ undefined ].concat(pages);
    if (pages.length % 2 > 0) {
        pages = pages.concat([ undefined ]);
    }
    const result = [];
    for (let pi = 0, pl = pages.length; pi < pl; pi += 2) {
        result.push([ pages[pi], pages[pi + 1] ]);
    }
    return result;

}
module.exports = { pages, doublePages };