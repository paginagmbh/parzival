function pageSigil({ leaf, page }) {
    let leafStr;
    if (leaf > 99) {
        leafStr = leaf.toString();
    } else if (leaf > 9) {
        leafStr = `0${leaf}`;
    } else {
        leafStr = `00${leaf}`;
    }

    return [leafStr, page].join("");
}

module.exports = { pageSigil };