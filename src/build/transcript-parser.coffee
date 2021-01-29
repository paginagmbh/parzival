fs = require "fs"

escape = require "escape-html"

m = require "../lib/manuscript"
v = require "../lib/verse"
markup = require "./markup"

xmlId = (el) -> (markup.attr el, "xml:id").replace /[^_]+_(RP|NEU)/i, ""

verseSigil = (el) ->
  sigil = (xmlId el).replace /^_+/, ""
  n = (markup.attr el, "n")
  sigil = v.p2np v.parse sigil
  { sigil..., n }

breakSigil = (el) -> m.parsePageSigil (xmlId el)

supplied = (e) ->
  type = (markup.attr e, "type", "")
  classes = ["supplied", e.local]
  classes.push "anweisung" if type is "Anweisung"
  classes.push "kustode" if type is "Kustode"
  classes.push "reklamante" if type is "Reklamante"
  classes.push "nota" if type is "Notiz"
  classes.push "marginalia" if type is "Marginalie"

  switch e.event
    when "start" then "<span class=\"#{classes.join " "}\">"
    else "</span>"

edited = ({ event, local }) ->
  switch event
    when "start" then "<span class=\"edited #{local}\">"
    else "</span>"

ref = (e) ->
  switch e.event
    when "start"
      n = markup.attr e, "n", ""
      # Normalisieren der Versnummern, führende Nullen bei der Unternummer entfernen
      n = n.replace /([0-9]+)(\.)?(0)?([0-9]+)/, "$1$2$4"
      "<span class=\"ref\" title=\"vgl. Hs. V #{n}\">"
    else "</span>"

damage = (e) ->
  switch e.event
    when "start"
      agent = (markup.attr e, "agent", "").toLowerCase()
      classes = ["damage"]
      classes.push agent if agent
      "<span class=\"#{classes.join " "}\">"

    else "</span>"

gap = (e) ->
  switch e.event
    when "start"
      reason = (markup.attr e, "reason", "").toLowerCase()

      classes = ["gap"]
      classes.push "unreadable" if reason is "unleserlich"
      classes.push "lost" if reason is "fragmentverlust"

      placeholder = (markup.attr e, "quantity", "")
      "<span class=\"#{classes.join " "}\">#{placeholder}"

    else "</span>"

hi = (e) ->
  switch e.event
    when "start"
      classes = ["hi"]
      rend = markup.attr e, "rend", ""
      size = rend.match /([0-9]+)\-zeilig/

      classes.push "lines-#{size[1]}" if size?
      classes.push "red" if rend is "rot"
      classes.push "fleuronee" if rend.includes "Fleuronee"
      classes.push "lombarde" if rend.includes "Lombarde"
      classes.push "prachtinitiale" if rend.includes "Prachtinitiale"

      "<span class=\"#{classes.join " "}\" data-rend=\"#{rend}\">"

    else "</span>"

parseSource = ({ source, manuscript }, index) ->
  { start, ln, attr, emptyText, negate, every, contextual, element } = markup.filters
  ws = markup.whitespace

  transcript = await markup.events fs.createReadStream source

  isntMainText = (start ln "TEI")
  isMainText = (start ln "text", "orig", "reg", "corr", "ex")
  mainText = contextual isntMainText, isMainText
  transcript = (e for e in transcript when mainText e)

  paratext = (event) ->
    (event.local is "note") and switch (markup.attr event, "type")
      when "Kapitelüberschrift" then true
      when "Anweisung", "Reklamante", "Kustode", "Notiz" then true
      when "Marginalie" then false # FIXME: should these be displayed too?
      else false

  isntVerseText = start every (ln "text", "note"), (negate paratext)
  isVerseText = start ln "l", "lb", "cb"
  verseText = contextual isntVerseText, isVerseText
  transcript = (e for e in transcript when verseText e)

  compressWs = ws.compress (() -> false), ws.xmlSpace
  transcript = (compressWs e for e in transcript)

  breakLines = ws.breakLines (start ln "l", "cb"), index is 0
  transcript = (breakLines e for e in transcript)

  notEmptyText = negate emptyText()
  transcript = (e for e in transcript when notEmptyText e)

  transcript = for e in transcript
    switch e.event
      when "start"
        switch e.local
          when "cb", "pb" then { e..., (breakSigil e)... }
          when "l" then { e..., (verseSigil e)... }
          else e
      else e

  transcript.unshift { event: "start", local: "text", manuscript }
  transcript.push { event: "end", local: "text", manuscript }
  transcript

module.exports = (sources) ->
  sources = for source, si in sources
    do (source, si) -> parseSource source, si
  sources = await Promise.all sources

  source = sources.reduce ((all, one) -> all.concat one), []

  lastChar = ""
  inHeading = false
  inOrig = false
  origText = ""

  html = {}
  columns = {}
  verses = {}
  lines = {}
  line = null

  manuscript = undefined
  column = undefined
  verse = undefined
  n = undefined
  for e in source
    switch e.event
      when "start"
        switch e.local
          when "text" then manuscript = e.manuscript
          when "cb" then column = m.columnSigil e
          when "l"
            verse = v.toString e
            line = e.n

            lines[manuscript] ?= {}
            lines[manuscript][line] ?= {}
            lines[manuscript][line][column] ?= ""
            lines[manuscript][line].verse = verse

            columns[verse] ?= {}
            columns[verse][manuscript] ?= {}
            columns[verse][manuscript].column = column

            verses[manuscript] ?= {}
            verses[manuscript][column] ?= []
            verses[manuscript][column].push verse
          when "orig"
            inOrig = true
          when "choice"
            lines[manuscript][line][column] += "<span class=\"choice\" title=\"\">"
      when "end"
        switch e.local
          when "text" then manuscript = column = verse = undefined
          when "l" then verse = undefined
          when "orig"
            inOrig = false
            lines[manuscript][line][column] += "<span class=\"orig\" title=\"unkorrigierte Form (Rekonstruktion): #{origText}\">#{origText}</span>"
            origText = ""
          when "choice" then lines[manuscript][line][column] += "</span>"
    if verse? and not inOrig
      if e.event is "text"
        text = e.text.replace /\n/g, ""
        lastChar = text[-1..]
        lines[manuscript][line][column] += escape text
      else if (markup.attr e, "type") is "Kapitelüberschrift"
        inHeading = (e.event is "start")
      else
        lines[manuscript][line][column] += switch e.local
          when "note", "reg", "corr", "ex" then supplied e
          when "hi" then hi e
          when "del", "add" then edited e
          when "damage" then damage e
          when "gap" then gap e
          when "ref" then ref e if manuscript is "VV"
          when "lb"
            classes = ["lb"]
            classes.push "wb" if lastChar.match /\s/
            classes = classes.join " "
            result = ""
            if e.event is "start"
              result += "<span class=\"#{classes}\">|</span>"
              result += "<br class=\"#{classes}\" />" if inHeading
            result
          else ""
    else if e.event is "text" and inOrig
        text = e.text.replace /\n/g, ""
        text = escape text
        origText += text
        #lines[manuscript][line][column] += "<span class=\"orig\" title=\"unkorrigierte Form (Rekonstruktion): #{titleText}\">#{text}</span>"

  lc = 0
  rightIndex = 1

  for leftIndex, line of lines["V"]

    leftVerse = line.verse
    rightVerse = if lines["VV"][rightIndex] then lines["VV"][rightIndex].verse else null
    nextRightVerse = if lines["VV"][rightIndex + 1] then lines["VV"][rightIndex + 1].verse else null
    nextLeftVerse = if lines["V"][leftIndex + 1] then lines["V"][leftIndex + 1].verse else null
    previousLeftVerse = if lines["V"][leftIndex - 1] then lines["V"][leftIndex - 1].verse else null


    if previousLeftVerse and (v.compare (v.parse previousLeftVerse), (v.parse leftVerse)) is 0
      html[lc - 1]["V"] = Object.assign {}, html[lc - 1]["V"], line
      continue

    html[lc] ?= {}

    # first check if we are dealing with additional lines added on the right hand side
    range = [(v.parse previousLeftVerse), (v.parse leftVerse)]

    while rightVerse and ((v.compare (v.parse leftVerse), (v.parse rightVerse)) isnt 0) and
    ((v.within range, v.parse rightVerse) or
    (v.compare (v.parse rightVerse), (v.parse nextRightVerse)) > 0 or
    (v.compare (v.parse leftVerse), (v.parse rightVerse)) > 0)
      # this is a comment line added on the right side
      html[lc]["VV"] = lines["VV"][rightIndex]
      columns[rightVerse]["VV"].line = lc
      lc++
      html[lc] ?= {}
      rightIndex++
      rightVerse = if lines["VV"][rightIndex] then lines["VV"][rightIndex].verse else null
      nextRightVerse = if lines["VV"][rightIndex + 1] then lines["VV"][rightIndex + 1].verse else null

    # now check if left and right side match the same verse
    if (v.compare (v.parse leftVerse), (v.parse rightVerse)) is 0
      html[lc]["V"] = line
      html[lc]["VV"] = lines["VV"][rightIndex]
      columns[leftVerse]["V"].line = lc
      columns[rightVerse]["VV"].line = lc
      rightIndex++
      if lines["VV"][rightIndex]? and lines["VV"][rightIndex].verse is leftVerse
        # need to add the next line as well
        html[lc]["VV"] = Object.assign html[lc]["VV"], lines["VV"][rightIndex]
        rightIndex++
    else
      html[lc]["V"] = line
      columns[leftVerse]["V"].line = lc

    lc++

  # remove gaps in V by re-aligning
  for line, lineData of html

    # determine next VV gap
    lineInt = parseInt line
    needMove = false
    offset = 1

    if !lineData.V and (!lineData.VV || columns[lineData.VV.verse].V?)
      needMove = true
      while html[lineInt + offset] and html[lineInt + offset].VV
        column = Object.keys html[lineInt + offset].VV
          .filter ((k) -> k isnt "verse")
          .shift()
        break unless html[lineInt + offset].VV[column]
        offset++

    needMove = needMove and (offset < 6)

    while needMove and offset >= 1
      continue if !html[lineInt + offset]?
      originalVerse = html[lineInt + offset].VV.verse if html[lineInt + offset].VV and html[lineInt + offset].VV.verse
      if originalVerse and html[lineInt + offset].VV
        column = Object.keys html[lineInt + offset].VV
          .filter ((k) -> k isnt "verse")
          .shift()
        columns[originalVerse].VV = { column } unless html[lineInt + offset].VV[column]
      html[lineInt + offset].VV = html[lineInt + offset - 1].VV
      if (html[lineInt + offset].VV)
        columns[html[lineInt + offset].VV.verse].VV.line = lineInt + offset
      offset--

    verse = columns[html[lineInt]] ? undefined
    verses.VV[column] = verses.VV[column].filter ((v) -> v isnt verse) if needMove and verse
    delete columns[html[lineInt].VV.verse].VV if needMove and verse
    delete html[line] if needMove

  #{ lines, html, columns, verses }
  { html, columns, verses }
