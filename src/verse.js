const { min } = Math;

function parse(str) {
    const numsRe = /^([0-9.]+)/g;
    const numsMatch = numsRe.exec(str);
    if (numsMatch === null) {
        throw new Error(str);
    }

    let [,  nums ] = numsMatch;
    nums = nums.split(".").map(n => parseInt(n, 10));

    const plus = [];
    const plusRe = /\[(\d+)]/g;
    let plusMatch;
    while ((plusMatch = plusRe.exec(str)) !== null) {
        let [,  plusVerse ] = plusMatch;
        plus.push(parseInt(plusVerse, 10));
    }

    return { nums, plus };
}

function compareComponent(a, b) {
    for (let nn = 0, nl = min(a.length, b.length); nn < nl; nn++) {
        const diff = a[nn] - b[nn];
        if (diff == 0) {
            continue;
        }
        return diff < 0 ? -1 : 1;
    }
    const diff = a.length - b.length;
    return diff == 0 ? 0 : (diff < 0 ? -1 : 1);
}

function compare(a, b) {
    const diff = compareComponent(a.nums, b.nums);
    return diff == 0 ? compareComponent(a.plus, b.plus) : diff;
}

function within([startIncl, endIncl], v) {
    return compare(startIncl, v) <= 0 && compare(endIncl, v) >= 0;
}

module.exports = { parse, compare, within };