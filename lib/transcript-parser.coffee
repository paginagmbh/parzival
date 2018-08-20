fs = require "fs"

escape = require "escape-html"

m = require "./manuscript"
v = require "./verse"
markup = require "./markup"

xmlId = (el) -> (markup.attr el, "xml:id").replace /[^_]+_NEU/i, ""

verseSigil = (el) ->
  sigil = (xmlId el).replace /^_+/, ""

  components = sigil.split "-"
  { nums, plus } = v.parse components.shift()
  components = ((parseInt c, 10) or c for c in components)

  if nums.length is 2 and nums[0] is 733 and nums[1] >= 100000
    nums = [ nums[1] - 100000 ]
  plus = (c for c in components when not isNaN c)

  variant = (c for c in components when isNaN c)
  variant = if variant.length is 0 then undefined else variant

  { nums, plus, variant }

breakSigil = (el) -> m.parsePageSigil (xmlId el)

supplied = ({ event, local }) ->
  switch event
    when "start" then "<span class=\"supplied #{local}\">"
    else "</span>"

edited = ({ event, local }) ->
  switch event
    when "start" then "<span class=\"edited #{local}\">"
    else "</span>"

hi = (e) ->
  switch e.event
    when "start"
      classes = ["hi"]
      rend = markup.attr e, "rend", ""

      classes.push "red" if rend is "rot"
      classes.push "fleuronee" if rend.includes "Fleuronee"
      classes.push "lombarde" if rend.includes "Lombarde"
      classes.push "prachtinitiale" if rend.includes "Prachtinitiale"

      "<span class=\"#{classes.join " "}\" data-rend=\"#{rend}\">"

    else "</span>"

parseSource = ({ source, manuscript }, index) ->
  { start, ln, attr, emptyText, negate, every, contextual } = markup.filters
  ws = markup.whitespace

  transcript = await markup.events fs.createReadStream source

  isntMainText = (start ln "TEI", "choice")
  isMainText = (start ln "text", "reg", "corr", "ex")
  mainText = contextual isntMainText, isMainText
  transcript = (e for e in transcript when mainText e)

  heading = attr "type", "Kapitelüberschrift"
  isntVerseText = start every (ln "text", "note"), (negate heading)
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

  transcript = {}
  collation = {}

  manuscript = undefined
  column = undefined
  verse = undefined
  for e in source
    switch e.event
      when "start"
        switch e.local
          when "text" then manuscript = e.manuscript
          when "cb" then column = m.columnSigil e
          when "l"
            verse = v.toString e

            collation[verse] ?= {}
            collation[verse][manuscript] ?= column

            transcript[manuscript] ?= {}
            transcript[manuscript][column] ?= []
            transcript[manuscript][column].push (verse = { verse, html: "" })
      when "end"
        switch e.local
          when "text" then manuscript = column = verse = undefined
          when "l" then verse = undefined
    if verse?
      if e.event is "text"
        text = e.text.replace /\n/g, ""
        lastChar = text[-1..]
        verse.html += escape text
      else if (markup.attr e, "type") is "Kapitelüberschrift"
        inHeading = (e.event is "start")
      else
        verse.html += switch e.local
          when "reg", "corr", "ex" then supplied e
          when "hi" then hi e
          when "del", "add" then edited e
          when "lb"
            classes = ["lb"]
            classes.push "wb" if lastChar.match /\s/
            classes = classes.join " "
            html = ""
            if e.event is "start"
              html += "<span class=\"#{classes}\">|</span>"
              html += "<br class=\"#{classes}\">" if inHeading
            html
          else ""

  { transcript, collation }
