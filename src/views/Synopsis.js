import { scroller } from 'vue-scrollto/src/scrollTo'

import { binarySearch } from '../lib/search'
import v from '../lib/verse'
import transcript from '../data/transcript.json'

const verses = Object.keys(transcript.columns).map(v.parse)

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
  if (prev && pageBreak(prev, next, page)) {
    pages.push(page = newPage())
  }
  prev = next
  const verse = v.toString(next)
  page.title = page.title || verse
  if (page.start && v.compare(page.start, next) > 0) {
    page.start = next
  } else {
    page.start = page.start || next
  }
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

    pages () {
      const { verse, manuscript } = this

      const targetColumn = transcript.columns[verse] &&
        transcript.columns[verse][manuscript] ? transcript.columns[verse][manuscript].column : ''
      return (targetColumn || '').replace(/[ab]$/, '')
    },

    page () {
      const pageIndex = binarySearch(pages, v.parse(this.verse), (p, verse) => {
        if (v.compare(verse, p.start) < 0) {
          return 1
        } else if (v.compare(verse, p.end) > 0) {
          return -1
        }
        return 0
      })
      return Math.max(0, Math.min(pageIndex, pages.length - 1))
    },

    /* fullPreviousSynopsis () {
      return buildSynopsis(this, Math.max(this.page - 1, 0))
    }, */

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
      // console.log('no line data found for ', lineData)
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
          if (vueComponent[preferredManuscript] && vueComponent[preferredManuscript].verse) {
            return vueComponent[preferredManuscript].verse
          } else if (vueComponent.V && vueComponent.V.verse) {
            return vueComponent.V.verse
          } else if (vueComponent.VV && vueComponent.VV.verse) {
            return vueComponent.VV.verse
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
    synopsis.forEach((synopsisLine, synopsisIndex) => {
      if (synopsisLine[manuscript].isTransposition) {
        let offset = 1
        let gapFound = false

        // mark the preceding content rows with their transposition status
        while (!gapFound && offset < 12 && synopsisIndex - offset >= 1) {
          if (synopsis[synopsisIndex - offset][manuscript].isGap) {
            gapFound = true
            break
          }
          offset++
        }

        const startOffset = offset

        if (gapFound || synopsisIndex - startOffset === 0) {
          synopsis[synopsisIndex - offset][manuscript].transpositionStart = true

          for (let i = offset; i >= 0; i--) {
            synopsis[synopsisIndex - i][manuscript].transpositionPart = true
          }
        }

        // mark the following content rows with their transposition status
        offset = 1
        gapFound = false
        while (!gapFound && offset < 10 && synopsisIndex + offset <= synopsis.length) {
          if (!synopsis[synopsisIndex + offset] || !synopsis[synopsisIndex + offset][manuscript]) {
            // console.log(`synopsis[${synopsisIndex} + ${offset}] not defined for manuscript ${manuscript}`)
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

        synopsis[synopsisIndex - startOffset][manuscript].transpositionRowSpan = transpositionRowSpan
      }
    })
  }

  return synopsis
}
