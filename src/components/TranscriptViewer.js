import debounce from 'lodash.debounce'
import { scroller } from 'vue-scrollto/src/scrollTo'

import transcript from '../data/transcript.json'
import metadata from '../data/metadata.json'

export default {
  name: 'transcript-viewer',
  props: ['manuscript', 'pages', 'verse', 'syncScrolling'],

  computed: {
    text () {
      const { manuscript, pageList } = this
      const verses = transcript.verses[manuscript]
      const headings = metadata.headings[manuscript] || {}
      const columns = []
      for (const page of pageList) {
        if (!page) continue
        for (const columnSigil of ['a', 'b']) {
          const column = `${page}${columnSigil}`
          if (!(column in verses)) continue

          const columnHeadings = headings[column] || {}
          const contents = []

          for (const verse of verses[column]) {
            if (verse in columnHeadings) {
              contents.push({
                type: 'heading',
                heading: columnHeadings[verse]
              })
            }
            contents.push({
              type: 'verse',
              html: transcript.html[verse][manuscript][column],
              verse: verse.replace(/827.30\[([0-9]+)]/, 'Ep. $1')
            })
          }

          columns.push({ column, columnSigil, page, contents })
        }
      }
      return columns
    },

    verseWaypoint () {
      const setVerse = debounce(
        this.updateVerse.bind(this),
        250,
        { leading: true, trailing: true }
      )
      return {
        active: this.syncScrolling || false,
        callback: ({ el, going, direction }) => {
          if (going === 'in') {
            setVerse(el.textContent.trim())
          }
        },
        options: {
          root: this.$el,
          rootMargin: '-35% 0% -55% 0%',
          thresholds: [0, 100]
        }
      }
    }
  },

  methods: {
    updateVerse (verse) {
      this.$router.replace({
        ...this.$route,
        params: { ...this.$route.params, verse }
      })
    }
  },

  created () {
    const scroll = scroller()
    this.scrollToActive = debounce(() => this.$nextTick(() => {
      const active = this.$el.querySelector('th.is-active')
      if (!active) return

      scroll(active, 500, {
        container: this.$el,
        offset: -this.$el.offsetHeight / 3,
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
