import debounce from 'lodash.debounce'
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
      return pages[this.page].rows.map(verse => {
        const row = [ verse ]
        for (const manuscript of [this.manuscript, this.otherManuscript]) {
          const columns = transcript.html[verse][manuscript] || {}
          row.push(Object.keys(columns).sort().map(column => ({
            column: this.numTitle(column),
            html: columns[column]
          })))
        }
        return row
      })
    },

    pagination () {
      const first = Math.max(0, this.page - 5)
      const last = Math.min(first + 10, pages.length - 1)

      const pagination = []
      for (let index = first; index <= last; index++) {
        const page = pages[index]
        pagination.push({ ...page, index })
      }
      return pagination
    },

    prevPage () {
      return this.page === 0
        ? undefined
        : this.toVerse(pages[this.page - 1].title)
    },

    nextPage () {
      return this.page === (pages.length - 1)
        ? undefined
        : this.toVerse(pages[this.page + 1].title)
    },

    verseWaypoint () {
      return {
        // FIXME: break mutual dependency between waypoint and scrollToActive()
        active: false,
        callback: debounce(({ el, going, direction }) => {
          if (going === 'in') {
            this.updateVerse(el.getAttribute('data-verse'))
          }
        }, 1000),
        options: {
          root: this.$el,
          rootMargin: '-35% 0% -55% 0%',
          thresholds: [0, 100]
        }
      }
    }
  },

  created () {
    this.updateVerse = debounce((verse) => {
      this.$router.replace(this.toVerse(verse))
    }, 1000, { leading: true, trailing: false })

    const scroll = scroller()
    this.scrollToActive = debounce(() => this.$nextTick(() => {
      if (this.loading) return

      const active = this.$el.querySelector('tr.is-active td')
      if (!active) return

      const container = this.$el.querySelector('.parzival-overflow-scroll')

      scroll(active, 500, {
        container,
        offset: -container.offsetHeight / 3,
        force: true
      })
    }), 500)
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
