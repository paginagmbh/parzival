import debounce from 'lodash.debounce'

export default {
  name: 'transcript',
  props: ['manuscript', 'pages'],

  computed: {
    transcriptText () {
      const { manuscript, pageList } = this
      const columns = pageList.reduce((columns, page) => {
        if (page) {
          for (let column of ['a', 'b']) {
            column = `${page}${column}`
            if (column in this.transcript()[manuscript]) {
              columns.push(column)
            }
          }
        }
        return columns
      }, [])
      return columns.map(column => {
        const columnHeadings = (this.metadata().headings[manuscript] || {})[column] || {}
        return {
          column,
          columnClass: column.endsWith('a') ? 'is-primary' : 'is-light',
          page: column.replace(/[ab]$/, ''),
          contents: this.transcript()[manuscript][column].reduce(
            (contents, verse) => {
              const displayed = verse.verse.replace(
                /827.30\[([0-9]+)]/, 'Ep. $1'
              )
              const verseContents = [
                { type: 'verse', ...verse, verse: displayed }
              ]
              if (verse.verse in columnHeadings) {
                verseContents.unshift({
                  type: 'heading',
                  heading: columnHeadings[verse.verse]
                })
              }
              return contents.concat(verseContents)
            },
            []
          )
        }
      })
    },

    classes () {
      return {
        orientation: { 'is-vertical': this.$mq.touch },
        transcript: { 'is-4': this.$mq.desktop }
      }
    },

    verseWaypoint () {
      const setVerse = debounce(
        this.updateVerse.bind(this),
        500,
        { leading: true, trailing: true }
      )
      return {
        active: true,
        callback: ({ el, going, direction }) => {
          if (direction && going === 'in') {
            setVerse(el.textContent)
          }
        },
        options: {
          root: null,
          rootMargin: this.$mq.touch ? '-15% 0% -75% 0%' : '-35% 0% -55% 0%',
          thresholds: [0, 100]
        }
      }
    },

    verse () {
      return this.$route.query.verse
    }
  },

  methods: {
    updateVerse (verse) {
      this.$router.replace({
        ...this.$route,
        query: { ...this.$route.query, verse }
      })
    }
  },

  watch: {
    transcriptText () {
      const { transcript } = this.$refs
      if (transcript) {
        transcript.scrollTop = 0
      }
    }
  }
}
