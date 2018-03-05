const chai = require("chai");

chai.should();

const { parse, compare, within } = require("../lib/verse");

describe("verse", () => {
    it("parses standard verses", () => {
        const parsed = parse("800.10[3]");
        parsed.should.have.deep.property("nums", [800, 10]);
        parsed.should.have.deep.property("plus", [3]);
    });

    it("parses NP verses", () => {
        const parsed = parse("30000");
        parsed.should.have.deep.property("nums", [30000]);
        parsed.should.have.deep.property("plus", []);
    });

    it("compares verses", () => {
        const test = (a, b) => compare(parse(a), parse(b));

        test("800", "800").should.equal(0);
        test("800.10", "700.11").should.equal(1);
        test("800.10[0]", "800.10[0][1]").should.equal(-1);
    });

    it("checks ranges", () => {
        const test = ([start, end], v) => within(
            [parse(start), parse(end)],
            parse(v)
        );

        test(["799.1", "800"], "799.25").should.equal(true);
        test(["799.1[0]", "799.2"], "799.1[1][2]").should.equal(true);
        test(["799", "900"], "20000").should.equal(false);
    });
});