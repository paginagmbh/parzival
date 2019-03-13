import { scroller } from 'vue-scrollto/src/scrollTo'

import { binarySearch } from '../lib/search'
import v from '../lib/verse'
import transcript from '../data/transcript.json'

const verses = Object.keys(transcript.html).map(v.parse).sort(v.compare)

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
  props: ['manuscript', 'pages', 'verse'],

  computed: {
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
      for (const verse of pages[this.page].rows) {
        const active = verse === this.verse
        const row = { verse, active }
        let nextPage
        for (const manuscript of ['V', 'VV']) {
          row[manuscript] = []
          const columns = transcript.html[verse][manuscript] || {}
          for (const column of Object.keys(columns).sort()) {
            nextPage = nextPage || column.replace(/[ab]$/, '')
            row[manuscript].push({
              column: this.numTitle(column),
              html: columns[column]
            })
          }
        }

        row.waypoint = {
          active: !prevPage || prevPage !== nextPage,
          callback: ({ el, going, direction }) => {
            if (going === 'in') {
              const verseRoute = this.toVerse(el.getAttribute('data-verse'))
              console.log(verseRoute.params.pages)
              if (verseRoute.params.pages === this.pages) return
              this.$router.replace(verseRoute)
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
        : this.toVerse(pages[this.page - 1].title)
    },

    nextSynopsis () {
      return this.page === (pages.length - 1)
        ? undefined
        : this.toVerse(pages[this.page + 1].title)
    }
  },

  created () {
    this.updateVerse = (verse) => {
      this.$router.replace(this.toVerse(verse))
    }

    const scroll = scroller()
    this.scrollToActive = () => this.$nextTick(() => {
      if (this.loading) return

      const active = this.$el.querySelector('tr.is-active td.parzival-verse')
      if (!active) return

      const container = this.$el.querySelector('.parzival-overflow-scroll')

      scroll(active, 500, { container })
    })
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
