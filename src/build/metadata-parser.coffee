assert = require "assert"
path = require "path"

globby = require "globby"
xfs = require "fs-extra"

csvParse = require "csv-parse/lib/sync"
csvStringify = require "csv-stringify/lib/sync"


quire = require "../lib/quire"
{ equal, columnSigil, pageSigil, parsePageSigil, pageRange, pageSeq } = require "../lib/manuscript"
verse = require "../lib/verse"

verseSort = (a, b) ->
  (verse.compare a.start, b.start) or (verse.compare a.end, b.end)

{ cwd, encoding } = require "./util"

metadataDir = path.resolve cwd, "metadata"
quiresPath = path.resolve cwd, "metadata", "quires.csv"
quireIconsDir = path.resolve cwd, "public", "quire-icons"

metadata =
  K:
    sigil: "V"
    title: "Karlsruhe, Bad. Landesbibl., Donaueschingen 97"
    hands:
      I: "I"
      II: "II"
      III: "III"
      IV: "IV"
      V: "V"
    verses: path.resolve metadataDir, "verses_v.txt"
    verseParser: (record, state) ->
      handMatch = /Schreiber ([IV]+):/.exec record
      if handMatch
        state.hand = this.hands[handMatch[1]];
        return undefined

      re = /Bl\. (vs)?(\d+)([rv])([ab]): (?:NP )?([0-9.[\]]+) - (?:NP )?([0-9.[\]]+)/
      match = re.exec record
      return undefined if not match?

      [, prefix, leaf, page, column, start, end ] = match;
      leaf = parseInt leaf, 10
      { hand } = state
      { prefix, leaf, page, column, start, end, hand }

  R:
    sigil: "VV"
    title: "Roma, Biblioteca Casanatense, Ms. 1409"
    hands:
      R1: "I"
      R2: "II"
    verses: path.resolve metadataDir, "verses_vv.txt"
    verseParser: (record) ->
      re = /Bl\. (vs)?(\d+)([rv])([ab]): ([0-9.[\]]+) – ([0-9.[\]]+)/
      match = re.exec record
      return undefined if not match?

      [, prefix, leaf, page, column, start, end ] = match;
      leaf = parseInt leaf, 10
      hand = this.hands[if leaf <= 48 then "R1" else "R2"]
      { prefix, leaf, page, column, start, end, hand }

module.exports = () ->
  quireTypes = await globby "*.gif", { cwd: quireIconsDir }

  quireTypes = (qt for qt in quireTypes when qt.includes "p_")
  quireTypes = (qt.split "p_" for qt in quireTypes)

  quireTypeCounter = (idx, [ qt ]) -> { idx..., [qt]: (idx[qt] ? 0) + 1 }
  quireTypes = quireTypes.reduce quireTypeCounter, {}

  quireTypeIndexer = (idx, qt) ->
    count = quireTypes[qt]
    pages = pageSeq { leaf: 1, page: "r" }, count
    leafs = quire.leafs pages
    { idx..., [qt]: { count, pages, leafs } }

  quireTypes = (Object.keys quireTypes).reduce quireTypeIndexer, {}

  quires = await xfs.readFile quiresPath, { encoding }
  quires = csvParse quires, { columns: ["manuscript", "pages", "num", "quire"] }
  quires = (q for q in quires when q.quire)

  quires = for q in quires
    { manuscript } = q
    type = q.quire
    num = q.num
    quireType = quireTypes[type]
    { count, pages, leafs } = quireType

    manuscriptPages = (parsePageSigil p for p in q.pages.split "–")
    manuscriptPages = pageRange manuscriptPages...
    manuscriptLeafs = quire.leafs manuscriptPages

    assert.equal manuscriptPages.length, count, { manuscriptPages, quireType }

    for page, pi in manuscriptPages
      singlePage = "#{type}p_#{pageSigil pages[pi], 1}"
      doublePage = manuscriptLeafs
                .map (l, li) -> ({ l, li })
                .filter ({ l }) -> l.some (lp) -> lp? and equal lp, page
                .map ({ li }) -> leafs[li]
                .map (leaf) ->
                  leaf
                    .filter (p) -> p
                    .map (p) -> pageSigil p, 1
                    .join ""
                .map (leaf) -> "#{type}_#{leaf}"
                .shift()
      page = pageSigil page
      { manuscript, page, type, num, singlePage, doublePage }

  quires = quires.reduce ((all, one) -> all.concat one), []

  manuscripts = {}
  for manuscript in ["K", "R"]
    verses = {}
    pages = []
    data = metadata[manuscript]
    records = await xfs.readFile data.verses, { encoding }
    records = records.split /[\n\r]+/

    parser = data.verseParser.bind data
    parserState = {}
    for record in records
      parsed = parser record, parserState
      if parsed?
        page = pageSigil parsed
        pages.push page if (pages.length is 0) or (pages[pages.length - 1] isnt page)
        if (parsed.start isnt "0") and (parsed.end isnt "0")
          start = verse.parse parsed.start
          end = verse.parse parsed.end

          assert.ok (verse.compare start, end) <= 0
          assert.ok start.nums.length is end.nums.length
          column = columnSigil parsed
          verses[column] = verses[column] || []
          verses[column].push { parsed..., start, end }

    msQuires = {}
    for p in pages
      [ q ] = (q for q in quires when q.page is p and q.manuscript is manuscript)
      if q?
        { singlePage, doublePage, type, num } = q
        msQuires[p] = { singlePage, doublePage, type, num }

    p = []
    np = []

    for c, vs of verses
      for v in vs
        if verse.p v.start then p.push v
        if verse.np v.start then np.push v

    p.sort verseSort
    np.sort verseSort

    { sigil, title } = data
    manuscripts[sigil] =
      title: title
      columns: verses
      pages: pages
      quires: msQuires
      p: p
      np: np

  { manuscripts }
