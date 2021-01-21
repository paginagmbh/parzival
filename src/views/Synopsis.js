import { binarySearch } from '../lib/search'
import { scroller } from 'vue-scrollto/src/scrollTo'
import transcript from '../data/transcript.json'
import v from '../lib/verse'

const debug = require('debug')('parzival:synopsis')
const verses = Object.keys(transcript.columns).map(v.parse).sort(v.compare)

const pageBreak = (prev, next, page) => {
  if (prev.nums.length !== next.nums.length) return true
  return page.rows.length === 60
}
const newPage = () => ({ start: null, end: null, title: null, rows: [] })

let page = newPage()
const pages = [ page ]
let prev
for (let vc = 0, vl = verses.length; vc < vl; vc++) {
  const next = verses[vc]
  const verse = v.toString(next)
  const line = parseInt(getLineIndex(verse))
  next.line = line

  if (prev && pageBreak(prev, next, page)) {
    pages.push(page = newPage())
  }
  prev = next

  page.title = page.title || verse
  page.start = page.start || next
  page.end = next
  page.rows.push(verse)
}

export default {
  name: 'synopsis',
  props: ['verse'],

  data: () => ({
    excludedVerses: require('@/data/excluded-verses').excludedVerses,
    lastSearch: '',
    manuscript: 'V',
    scrolling: false
  }),

  computed: {

    excludedVersesHtml () {
      return '<ul>' + this.excludedVerses.map(v => v.join(' - ')).map(v => '<li>' + v + '</li>').join('') + '</ul>'
    },

    line () {
      return getLineIndex(this.verse)
    },

    pages () {
      const { verse, manuscript } = this

      const targetColumn = transcript.columns[verse] &&
        transcript.columns[verse][manuscript] ? transcript.columns[verse][manuscript].column : ''
      return (targetColumn || '').replace(/[ab]$/, '')
    },

    page () {
      let pageIndex = binarySearch(pages, this.line, (p, line) => {
        if (line < p.start.line) {
          return 1
        } else if (line > p.end.line) {
          return -1
        }
        return 0
      })
      // there might be transpositions causing the current verse to be on the previous or next page. check that...
      if (pageIndex > 0 && !pages[pageIndex].rows.some(r => r === this.verse)) {
        if (pages[pageIndex + 1] && pages[pageIndex + 1].rows.some(r => r === this.verse)) {
          pageIndex++
        } else if (pages[pageIndex - 1] && pages[pageIndex - 1].rows.some(r => r === this.verse)) {
          pageIndex--
        }
      }
      return Math.max(0, Math.min(pageIndex, pages.length - 1))
    },

    synopsis () {
      return buildSynopsis(this, this.page)
    },

    pagination () {
      const first = Math.max(0, this.page - 3)
      const last = Math.min(first + 6, pages.length - 1)

      const pagination = []
      for (let index = first; index <= last; index++) {
        const page = pages[index]
        pagination.push({ ...page, index })
      }
      return pagination
    },

    prevSynopsis () {
      return this.page === 0
        ? undefined
        : this.toSynopsis(pages[this.page - 1].title)
    },

    nextSynopsis () {
      return this.page === (pages.length - 1)
        ? undefined
        : this.toSynopsis(pages[this.page + 1].title)
    }
  },

  methods: {
    updateVerse (verse) {
      if (verse) {
        this.$router.replace(this.toSynopsis(verse))
      }
    }
  },

  created () {
    const scroll = scroller()
    this.scrollToActive = () => {
      if (this.scrolling) return
      this.$nextTick(() => {
        const container = this.$el.querySelector('.parzival-overflow-scroll')
        const active = this.$el.querySelector('tr.is-active td.parzival-verse')
        if (!active) return

        const onStart = () => { this.scrolling = true }
        const onDone = () => { this.scrolling = false }
        const onCancel = () => { this.scrolling = false }
        scroll(active, 500, { container, onStart, onDone, onCancel })
      })
    }
  },

  mounted () {
    this.scrollToActive()
  },

  watch: {
    $route () {
      this.scrollToActive()
    }
  }
}

function buildSynopsis (vueComponent, page) {
  debug('Building synopsis for page ' + page)
  const synopsis = []

  let prevPage

  const rowLength = pages[page].rows.length
  const startingLine = transcript.columns[pages[page].rows[0]]['V']
    ? transcript.columns[pages[page].rows[0]]['V'].line
    : transcript.columns[pages[page].rows[0]]['VV'].line
  const endingLine = transcript.columns[pages[page].rows[rowLength - 1]]['V']
    ? transcript.columns[pages[page].rows[rowLength - 1]]['V'].line
    : transcript.columns[pages[page].rows[rowLength - 1]]['VV'].line

  for (let i = startingLine; i <= endingLine; i++) {
    const lineData = transcript.html[i]

    if (!lineData) continue

    let active
    if (lineData.V || lineData.VV) {
      const line = lineData.V || lineData.VV
      const verse = line.verse
      active = verse === vueComponent.verse
    } else {
      debug('no line data found for ', lineData)
    }

    const verses = {
      'V': lineData.V ? lineData.V.verse : '',
      'VV': lineData.VV ? lineData.VV.verse : ''
    }

    const row = {
      active
    }

    synopsis.push(row)
    let nextPage

    for (const manuscript of ['V', 'VV']) {
      const isTransposition = v.isTranspositionStart(transcript.html, manuscript, i)
      const isGap = v.isGap(transcript.html, manuscript, i)

      row[manuscript] = {
        content: [],
        isGap,
        isTransposition,
        verse: verses[manuscript]
      }

      const columns = transcript.html[i][manuscript] || {}
      for (const column of Object.keys(columns).filter(c => c !== 'verse').sort()) {
        nextPage = nextPage || column.replace(/[ab]$/, '')
        row[manuscript].content.push({
          column: vueComponent.numTitle(column),
          html: vueComponent.activateAllMouseOvers(columns[column])
        })
        row.getVerse = function (preferredManuscript) {
          const prefManuscriptObject = this[preferredManuscript];
          if (prefManuscriptObject && prefManuscriptObject.verse) {
            return prefManuscriptObject.verse
          } else if (this.V && this.V.verse) {
            return this.V.verse
          } else if (this.VV && this.VV.verse) {
            return this.VV.verse
          } else {
            return undefined
          }
        }
      }
    }

    row.waypoint = {
      active: !prevPage || prevPage !== nextPage,
      callback: ({ el, going, direction }) => {
        if (vueComponent.scrolling) return
        if (going === 'in') {
          debug("Waypoint triggered for ", el)
          const verseRoute = vueComponent.toSynopsis(el.getAttribute('data-verse'))
          if (verseRoute) {
            if (verseRoute.params.verse === vueComponent.verse) return
            vueComponent.$router.replace(verseRoute)
          }
        }
      },
      options: {
        root: vueComponent.$el
      }
    }

    prevPage = nextPage
  }

  // mark transpositions
  for (const manuscript of ['V', 'VV']) {
    const danglingGaps = new Set()
    let transpositionActive = false

    synopsis.forEach((synopsisLine, synopsisIndex) => {
      if (synopsisLine[manuscript].isGap) {
        if (!transpositionActive) {
          debug(`Adding a dangling gap on page ${page} for ${manuscript}: ${synopsisLine[manuscript].verse}`)
          danglingGaps.add(synopsisLine[manuscript].verse)
        }
        transpositionActive = !transpositionActive
      }

      if (synopsisLine[manuscript].isTransposition) {
        transpositionActive = true
        let offset = 1
        let gapFound = false

        // mark the preceding content rows with their transposition status
        while (!gapFound && offset < 12 && synopsisIndex - offset >= 1) {
          if (synopsis[synopsisIndex - offset][manuscript].isGap) {
            danglingGaps.delete(synopsis[synopsisIndex - offset][manuscript].verse)
            debug(`Removed a dangling gap on page ${page}: ${synopsis[synopsisIndex - offset][manuscript].verse}`)
            gapFound = true
            break
          }
          offset++
        }

        const startOffset = gapFound ? offset : 0

        if (gapFound || synopsisIndex - startOffset === 0) {
          synopsis[synopsisIndex - startOffset][manuscript].transpositionStart = true

          for (let i = startOffset; i >= 0; i--) {
            synopsis[synopsisIndex - i][manuscript].transpositionPart = true
          }
        }

        // mark the following content rows with their transposition status
        offset = 1
        gapFound = false
        while (!gapFound && offset < 10 && synopsisIndex + offset <= synopsis.length) {
          if (!synopsis[synopsisIndex + offset] || !synopsis[synopsisIndex + offset][manuscript]) {
            debug(`synopsis[${synopsisIndex} + ${offset}] not defined for manuscript ${manuscript}`)
          } else if (synopsis[synopsisIndex + offset][manuscript].isGap) {
            gapFound = true
            break
          }
          offset++
        }

        const endOffset = offset - 1
        let transpositionRowSpan = endOffset + startOffset + 1
        if (transpositionRowSpan > synopsis.length) {
          transpositionRowSpan = synopsis.length - startOffset
        }

        for (let i = synopsisIndex + endOffset; i > synopsisIndex; i--) {
          if (synopsis[i] && synopsis[i][manuscript]) {
            synopsis[i][manuscript].transpositionPart = true
          }
        }

        synopsis[Math.max(0, synopsisIndex - startOffset)][manuscript].transpositionRowSpan = transpositionRowSpan
      }
    })

    if (danglingGaps.size > 0) {
      debug(`There are dangling gaps on this page ${page}: ${JSON.stringify(Array.from(danglingGaps))}`)
      danglingGaps.forEach((gap, i) => {
        const gapIndex = synopsis.findIndex(se => se[manuscript].verse === gap)
        debug(`Processing gap ${gap} for manuscript ${manuscript} ...`)
        debug(`gapIndex is ${gapIndex}`)
        let candidates = []
        if (gapIndex > 0 && gapIndex < 10) {
          // mark beginning of page up to gap as transposition, if there are no other transpositions already
          candidates = synopsis.slice(0, gapIndex)
          debug(`Candidates for start area ${page}: ${candidates.join(', ')}`)
        } else if (gapIndex > synopsis.length - 10) {
          // mark gap to ending of page as transposition, if there are no other transpositions already
          candidates = synopsis.slice(gapIndex, synopsis.length)
          debug(`Candidates for end area ${page}: ${candidates.join(', ')}`)
        }
        const alreadyContainsTransposition = candidates.some(c => c.transpositionPart)
        debug(`Area already contains a transposition: ${alreadyContainsTransposition}`)
        if (candidates[0] && !alreadyContainsTransposition) {
          debug(`Starting to mark transpositions...`)
          for (let j = candidates.length - 1; j >= 0; j--) {
            debug(`Marking candidates[${j}][${manuscript}] as a transposition part`)
            candidates[j][manuscript].transpositionPart = true
          }
          candidates[0][manuscript].transpositionStart = true
          candidates[0][manuscript].transpositionRowSpan = candidates.length
          debug(`Transposition marking ended...`)
        }
      })
    }
  }

  return synopsis
}

function getLineIndex (verse) {
  const column = transcript.columns[verse]
  if (column && column.V) {
    return column.V.line
  } else if (column && column.VV) {
    return column.VV.line
  } else {
    return undefined
  }
}
