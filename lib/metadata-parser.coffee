assert = require "assert"
path = require "path"

globby = require "globby"
xfs = require "fs-extra"

csvParse = require "csv-parse/lib/sync"
csvStringify = require "csv-stringify/lib/sync"


quire = require "./quire"
{ equal, pageSigil, parsePageSigil, pageRange, pageSeq } = require "./manuscript"
verse = require "./verse"

verseSort = (a, b) ->
  (verse.compare a.start, b.start) or (verse.compare a.end, b.end)

encoding = "utf-8"
cwd = path.resolve __dirname, ".."

metadataDir = path.resolve cwd, "metadata"

quiresPath = path.resolve cwd, "metadata", "quires.csv"
quireIconsDir = path.resolve cwd, "frontend", "quire-icons"

metadata =
  K:
    sigil: "V"
    title: "Karlsruhe, Bad. Landesbibl., Donaueschingen 97"
    hands:
      I: "K1"
      II: "K2"
      III: "K3"
      IV: "K4"
      V: "K5"
    verses: path.resolve metadataDir, "verses_v.txt"
    verseParser: (record, state) ->
      handMatch = /Schreiber ([IV]+):/.exec record
      if handMatch
        state.hand = this.hands[handMatch[1]];
        return undefined

      re = /Bl\. (\d+)([rv])([ab]): (?:NP )?([0-9.[\]]+) - (?:NP )?([0-9.[\]]+)/
      match = re.exec record
      return undefined if not match?

      [, leaf, page, column, start, end ] = match;
      leaf = parseInt leaf, 10
      { hand } = state
      { leaf, page, column, start, end, hand }

  R:
    sigil: "VV"
    title: "Roma, Biblioteca Casanatense, Ms. 1409"
    hands:
      R1: "R1"
      R2: "R2"
    verses: path.resolve metadataDir, "verses_vv.txt"
    verseParser: (record) ->
      re = /Bl\. (\d+)([rv])([ab]): ([0-9.[\]]+) – ([0-9.[\]]+)/
      match = re.exec record
      return undefined if not match?

      [, leaf, page, column, start, end ] = match;
      leaf = parseInt leaf, 10
      hand = this.hands[if leaf <= 48 then "R1" else "R2"]
      { leaf, page, column, start, end, hand };

headings =
  V:
    "115rb":
      "0[1][1]": ["Prosaüberleitung zum ›Nuwen Parzifal‹ mit Jahresangabe 1336"]
    "115va":
      "0[1][3]": ["Blattberechnungen"]
      "0[1][4]": ["Blattberechnungen"]
      "0[1]": [
        "Sieben Minneliedstrophen (›Rappoltsteiner Florilegium‹)",
        "Walther von der Vogelweide (Walther 62, IV [L. 93,7])"]
      "0[13]": ["Walther von Mezze (KLD 62, III,1)"]
    "115vb":
      "0[20]": ["Gottfried von Neifen (KLD 15, II,1)"]
      "0[27]": ["Gottfried von Neifen (KLD 15, II,2)"]
      "0[34]": ["Gottfried von Neifen (KLD 15, II,3)"]
      "0[42]": ["Reinmar der Alte (MF XXI, XII, 3)"]
      "0[51]": ["Reinmar von Brennenberg (KLD 44, IV, 4)"]
    "116ra":
      "1": ["Klaus Wisse und Philipp Colin, ›Nuwer Parzifal‹"]

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
  quires = csvParse quires, { columns: ["manuscript", "pages", "quire"] }
  quires = (q for q in quires when q.quire)

  quires = for q in quires
    { manuscript } = q
    type = q.quire
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
      { manuscript, page, singlePage, doublePage }

  quires = quires.reduce ((all, one) -> all.concat one), []

  manuscripts = {}
  for manuscript in ["K", "R"]
    verses = []
    data = metadata[manuscript]
    records = await xfs.readFile data.verses, { encoding }
    records = records.split /[\n\r]+/

    parser = data.verseParser.bind data
    parserState = {}
    for record in records
      parsed = parser record, parserState
      if parsed?
        start = verse.parse parsed.start
        end = verse.parse parsed.end

        assert.ok (verse.compare start, end) <= 0
        assert.ok start.nums.length is end.nums.length

        verses.push { parsed..., start, end }

    pages = verses.reduce ((idx, c) -> { idx..., [pageSigil c]: true }), {}
    pages = (Object.keys pages).sort()

    msQuires = {}
    for p in pages
      [ q ] = (q for q in quires when q.page is p and q.manuscript is manuscript)
      if q?
        { singlePage, doublePage } = q
        msQuires[p] = { singlePage, doublePage }

    p = (v for v in verses when verse.p v.start).sort verseSort
    np = (v for v in verses when verse.np v.start).sort verseSort

    { sigil, title } = data
    manuscripts[sigil] =
      title: title
      columns: verses
      pages: pages
      quires: msQuires
      p: p
      np: np

  { manuscripts, headings }