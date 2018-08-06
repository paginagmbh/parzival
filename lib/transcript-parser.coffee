fs = require "fs"

escape = require "escape-html"

m = require "./manuscript"
v = require "./verse"
markup = require "./markup"

xmlId = (el) -> el.attributes["xml:id"].value.replace /[^_]+_NEU/i, ""

verseSigil = (el) ->
  sigil = xmlId el
    .replace /^_+/, ""

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

module.exports =
  parse: ({ source, manuscript, text, num }, index) ->
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
            when "cb", "pb" then { e..., (breakSigil e)..., manuscript }
            when "l" then { e..., (verseSigil e)..., text }
            else e
        else e

  index: (transcript) ->
    verse = false
    columns = []
    for e in transcript
      if e.event is "start"
        switch e.local
          when "l" then verse = true
          when "cb"
            column = m.columnSigil e
            if columns[0]?.column isnt column
              columns.unshift
                manuscript: e.manuscript
                page: m.pageSigil e
                column: column
                contents: []


      columns[0].contents.push e if verse and columns.length isnt 0
      verse = false if e.event is "end" and e.local is "l"

    lastChar = ""
    index = {}
    for column in columns.reverse()
      verses = []
      inHeading = false
      for e in column.contents
        if e.event is "start" and e.local is "l"
          verses.unshift
            verse: v.toString e
            html: ""
        else if verses[0]?
          if e.event is "text"
            text = e.text.replace /\n/g, ""
            lastChar = text[-1..]
            verses[0].html += escape text
          else if (markup.attr e, "type") is "Kapitelüberschrift"
            inHeading = (e.event is "start")
          else
            verses[0].html += switch e.local
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

      delete column.contents
      { manuscript, page } = column

      manuscript = index[manuscript] ?= {}
      page = manuscript[page] ?= []
      page.push { column..., verses: verses.reverse() }
    index