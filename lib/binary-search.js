/* https://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/ */

module.exports = function(arr, searchElement, compare) {
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
};