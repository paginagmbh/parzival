import { scroller } from 'vue-scrollto/src/scrollTo'

import { binarySearch } from '../lib/search'
import v from '../lib/verse'
import transcript from '../data/transcript.json'

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
  if (prev && pageBreak(prev, next, page)) {
    pages.push(page = newPage())
  }
  prev = next
  const verse = v.toString(next)
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

    synopsis () {
      const synopsis = []

      let prevPage

      const rowLength = pages[this.page].rows.length
      const startingLine = transcript.columns[pages[this.page].rows[0]]['V']
        ? transcript.columns[pages[this.page].rows[0]]['V'].line
        : transcript.columns[pages[this.page].rows[0]]['VV'].line
      const endingLine = transcript.columns[pages[this.page].rows[rowLength - 1]]['V']
        ? transcript.columns[pages[this.page].rows[rowLength - 1]]['V'].line
        : transcript.columns[pages[this.page].rows[rowLength - 1]]['VV'].line

      for (let i = startingLine; i <= endingLine; i++) {
        const lineData = transcript.html[i]

        if (!lineData) continue

        let active
        if (lineData.V || lineData.VV) {
          const line = lineData.V || lineData.VV
          const verse = line.verse
          active = verse === this.verse
        } else {
          console.log('no line data found for ', lineData)
        }

        const verses = {
          'V': lineData.V ? lineData.V.verse : '',
          'VV': lineData.VV ? lineData.VV.verse : ''
        }

        const row = {
          active
        }

        let nextPage
        for (const manuscript of ['V', 'VV']) {
          // check if the current verse is a transposition
          const lineNum = parseInt(i)
          let offset = 1
          let firstLine = manuscript === 'V' ? this.firstLineForV : this.firstLineForVV

          while (lineNum - offset > firstLine &&
            (!transcript.html[lineNum - offset] ||
            !transcript.html[lineNum - offset][manuscript] ||
            !transcript.html[lineNum - offset][manuscript].verse)) {
            offset++
          }
          const previousLine = lineNum - offset
          const previousVerse = transcript.html[previousLine][manuscript] ? transcript.html[previousLine][manuscript].verse : undefined
          const parsedPreviousVerse = v.parse(previousVerse)
          const parsedCurrentVerse = v.parse(verses[manuscript])
          const isTransposition = parsedCurrentVerse &&
             parsedCurrentVerse.nums &&
             parsedCurrentVerse.nums.length &&
             v.compare(parsedPreviousVerse, parsedCurrentVerse) > 0

          row[manuscript] = {
            content: [],
            isTransposition,
            verse: verses[manuscript]
          }

          const columns = transcript.html[i][manuscript] || {}
          for (const column of Object.keys(columns).filter(c => c !== 'verse').sort()) {
            nextPage = nextPage || column.replace(/[ab]$/, '')
            row[manuscript].content.push({
              column: this.numTitle(column),
              html: this.activateAllMouseOvers(columns[column])
            })
            row.getVerse = function (preferredManuscript) {
              if (this[preferredManuscript] && this[preferredManuscript].verse) {
                return this[preferredManuscript].verse
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
            if (this.scrolling) return
            if (going === 'in') {
              const verseRoute = this.toSynopsis(el.getAttribute('data-verse'))
              if (verseRoute) {
                if (verseRoute.params.verse === this.verse) return
                this.$router.replace(verseRoute)
              }
            }
          },
          options: {
            root: this.$el
          }
        }

        prevPage = nextPage

        synopsis.push(row)
      }
      return synopsis
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
