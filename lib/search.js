const { max, min } = Math;
const { pageSigil } = require("./manuscript");
const verse = require("./verse");

/* https://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/ */
function binarySearch(arr, searchElement, compare) {
    let minIndex = 0;
    let maxIndex = arr.length - 1;
    let currentIndex;
    let currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = arr[currentIndex];

        const diff = compare(currentElement, searchElement);

        if (diff < 0) {
            minIndex = currentIndex + 1;
        } else if (diff > 0) {
            maxIndex = currentIndex - 1;
        } else {
            return currentIndex;
        }
    }

    return -1;
}

function searchByVerse({ np, p }, query) {
    const scope = verse.p(query) ? p : np;
    const index = binarySearch(scope, query, (col, query) => {
        const { start, end } = col;
        if (verse.compare(start, query) > 0) {
            return 1;
        } else if (verse.compare(end, query) < 0) {
            return -1;
        }
        return 0;
    });
    return index >= 0 ? pageSigil(scope[index]) : undefined;
}

function searchPage(manuscript, query) {
    query = query.replace(/[^0-9rv]/g, "");

    let [, leaf, page ] = /^([0-9]+)([rv])?$/.exec(query);
    leaf = leaf ? parseInt(leaf, 10) || undefined : undefined;
    page = page || "r";

    if (!leaf) {
        return undefined;
    }

    leaf = max(0, min(999, leaf));
    const sigil = pageSigil({ leaf, page });
    if (manuscript.pages.indexOf(sigil) < 0) {
        return undefined;
    }

    return sigil;
}

function searchVerse(manuscript, query) {
    query = query.replace(/[^0-9.[\]]/g, "");

    try {
        query = verse.parse(query);
    } catch (e) {
        query = undefined;
    }

    if (!query) {
        return undefined;
    }

    const page = searchByVerse(manuscript, query);
    if (!page) {
        return undefined;
    }

    return page;
}

function search(manuscript, query) {
    return /[rv]/.test(query)
        ? searchPage(manuscript, query)
        : searchVerse(manuscript, query);
}

module.exports = { search, searchPage, searchVerse };