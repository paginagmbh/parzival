import debounce from 'lodash.debounce'
import { scroller } from 'vue-scrollto/src/scrollTo'

import v from '../lib/verse'
import transcript from '../data/transcript.json'

export default {
  name: 'synopsis',
  props: ['manuscript', 'pages', 'verse'],

  computed: {
    verses () {
      return Object.keys(transcript.html).map(v.parse).sort(v.compare).map(v.toString)
    },

    verseWaypoint () {
      return {
        // FIXME: break mutual dependency between waypoint and scrollToActive()
        active: false,
        callback: debounce(({ el, going, direction }) => {
          if (going === 'in') {
            this.updateVerse(el.textContent.trim())
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

  methods: {
    synopsis () {
      let verses = Object.keys(transcript.html)

      verses = verses.map(v.parse).sort(v.compare).map(v.toString)

      verses = verses.map(verse => {
        const row = [verse]
        for (const manuscript of [this.manuscript, this.otherManuscript]) {
          const columns = transcript.html[verse][manuscript] || {}
          row.push(Object.keys(columns).sort().map(column => ({
            column: this.numTitle(column),
            html: columns[column]
          })))
        }
        return row
      })

      return verses
    },

    html (verse, manuscript) {
      const columns = transcript.html[verse][manuscript] || {}
      return Object.keys(columns).sort().map(c => columns[c]).join('') || '&ndash;'
    }
  },

  created () {
    this.updateVerse = debounce((verse) => {
      const { manuscript } = this
      const column = transcript.columns[verse][manuscript]
      if (!column) return
      const pages = column.replace(/[ab]$/, '')
      this.$router.replace({
        ...this.$route,
        params: { ...this.$route.params, pages, verse }
      })
    }, 1000, { leading: true, trailing: false })

    const scroll = scroller()
    this.scrollToActive = debounce(() => this.$nextTick(() => {
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
    },

    verse () {
      this.scrollToActive()
    }
  }
}
