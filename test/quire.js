const chai = require("chai");

chai.should();

const { Leaf, pages } = require("../lib/quire");

describe("quire", () => {

    it("flattens quires to pages", () => {
        pages(
            Leaf.fromArray([1, 2, [[3, 4, [], 5, 6]], 7, 8])
        ).should.deep.equal(
            [1, 2, 3, 4, 5, 6, 7, 8]
        );

        pages(
            Leaf.fromArray([
                undefined, undefined, [
                    [1, 2, [], 3, 4],
                    [5, 6, [], 7, 8]
                ],
                undefined, undefined
            ])
        ).should.deep.equal(
            [1, 2, 3, 4, 5, 6, 7, 8]
        );
    });
});