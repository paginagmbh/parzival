import debounce from 'lodash.debounce'
import { scroller } from 'vue-scrollto/src/scrollTo'

import transcript from '../data/transcript.json'
import TranscriptInfo from './TranscriptInfo'

export default {
  name: 'transcript-viewer',
  props: ['manuscript', 'pages', 'verse', 'syncScrolling'],
  components: {
    TranscriptInfo
  },

  data: () => ({
    excludedVerses: require('@/data/excluded-verses').excludedVerses,
    transcriptDocModal: false
  }),

  computed: {
    excludedVersesHtml () {
      return '<ul>' + this.excludedVerses.map(v => v.join(' - ')).map(v => '<li>' + v + '</li>').join('') + '</ul>'
    },
    text () {
      const { manuscript, pageList } = this
      const verses = transcript.verses[manuscript]
      const columns = []
      for (const page of pageList) {
        if (!page) continue
        for (const columnSigil of ['a', 'b']) {
          const column = `${page}${columnSigil}`
          if (!(column in verses)) continue

          const contents = []

          for (const verse of verses[column]) {
            const html = transcript.html[verse][manuscript][column]
            contents.push({ html, verse })
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
            setVerse(el.getAttribute('data-verse'))
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
