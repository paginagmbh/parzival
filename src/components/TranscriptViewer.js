import debounce from 'lodash.debounce'
import { scroller } from 'vue-scrollto/src/scrollTo'

export default {
  name: 'transcript-viewer',
  props: ['manuscript', 'pages', 'verse', 'syncScrolling'],

  computed: {
    text () {
      const transcript = this.transcript()[this.manuscript]
      const headings = this.metadata().headings[this.manuscript] || {}
      const columns = []
      for (const page of this.pageList) {
        if (!page) continue
        for (const columnSigil of ['a', 'b']) {
          const column = `${page}${columnSigil}`
          if (!(column in transcript)) continue

          const columnHeadings = headings[column] || {}
          const contents = []

          for (const verse of transcript[column]) {
            if (verse.verse in columnHeadings) {
              contents.push({
                type: 'heading',
                heading: columnHeadings[verse.verse]
              })
            }
            contents.push({
              type: 'verse',
              ...verse,
              verse: verse.verse.replace(/827.30\[([0-9]+)]/, 'Ep. $1')
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
    const fn = scroller()
    this.scrollToActive = debounce(() => this.$nextTick(() => fn(
      this.$el.querySelector('tr.is-active'), 500,
      { container: this.$el, offset: -this.$el.offsetHeight / 3, force: true }
    )), 500)
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
