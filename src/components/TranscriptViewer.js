import debounce from 'lodash.debounce'
import { scroller } from 'vue-scrollto/src/scrollTo'
import transcript from '../data/transcript.json'
import TranscriptInfo from './TranscriptInfo'
import v from '../lib/verse'

const debug = require('debug')('parzival:single-transcript')

export default {
  name: 'transcript-viewer',
  props: ['lastSearch', 'manuscript', 'pages', 'verse', 'syncScrolling'],
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
          const lines = verses[column].map(v => {
            try {
              const line = transcript.columns[v][manuscript].line || -1
              return line
            } catch {
              debug(`Could not map verse ${v} of manuscript ${manuscript}`)
              debug(transcript.columns[v][manuscript] ? transcript.columns[v][manuscript] : undefined)
            }
          }).filter(l => l)

          lines.forEach((line, i) => {
            // special treatment for empty lines
            if (line < 0) {
              const verse = verses[column][i]
              const isGap = verse === 'NP 31979'
              contents.push({ html: '', isGap, isTransposition: false, verse })
            } else if (transcript.html[line][manuscript] /* && transcript.html[line][manuscript][column] */) {
              const html = this.deactivateEmptyTitles(this.activateAllMouseOvers(this.deactivateRefTitles(transcript.html[line][manuscript][column])))
              const verse = transcript.html[line][manuscript].verse
              const isTransposition = v.isTranspositionStart(transcript.html, manuscript, line)
              const isGap = v.isGap(transcript.html, manuscript, line)

              contents.push({ html, isGap, isTransposition, verse })
            }
          })

          // mark transposition runs
          const danglingGaps = new Set()

          contents.forEach((c, i) => {
            if (c.isGap && danglingGaps.has(c.verse)) {
              debug(`Removing a dangling gap on page ${page}: ${c.verse}`)
              danglingGaps.delete(c.verse)
            } else if (c.isGap) {
              debug(`Adding a dangling gap on page ${page}: ${c.verse}`)
              danglingGaps.add(c.verse)
            }

            // if we found a transposed line, let's determine the beginning of the transposition
            // by finding the closest preceding gap and mark it appropriately
            if (c.isTransposition) {
              let offset = 1
              let gapFound = false
              while (!gapFound && offset < 8 && i - offset > 0) {
                if (contents[i - offset].isGap) {
                  danglingGaps.delete(contents[i - offset].verse)
                  debug(`Removed a dangling gap on page ${page}: ${contents[i - offset].verse}`)
                  gapFound = true
                  break
                }
                offset++
              }

              // mark the preceding contents rows with their transposition status
              const startOffset = Math.max(0, i - offset)
              contents[startOffset].transpositionStart = true
              // contents[Math.max(0, lastContentIndex - offset)].transpositionRowSpan = lastContentIndex > offset ? offset + 1 : lastContentIndex + 1

              for (let j = startOffset; j <= i; j++) {
                contents[j].transpositionPart = true
              }

              // now let's determine the ending of the transposition
              // by finding the closest following gap and mark it appropriately
              offset = 1
              gapFound = false
              while (!gapFound && offset < 10 && i + offset < contents.length) {
                if (contents[i + offset].isGap) {
                  danglingGaps.add(contents[i + offset].verse)
                  debug(`Added a dangling gap on page ${page}: ${contents[i + offset].verse}`)
                  gapFound = true
                  break
                }
                offset++
              }

              // mark the following content rows with their transposition status
              const endOffset = Math.min(contents.length - 1, i + offset - 1)
              const transpositionRowSpan = endOffset - startOffset + 1
              contents[endOffset].transpositionEnd = true
              contents[startOffset].transpositionRowSpan = transpositionRowSpan

              for (let j = endOffset; j >= i; j--) {
                contents[Math.min(contents.length - 1, j)].transpositionPart = true
              }
            }
          })

          if (danglingGaps.size > 0) {
            debug(`There are dangling gaps on this page ${page}: ${JSON.stringify(danglingGaps)}`)
            danglingGaps.forEach((gap, i) => {
              const gapIndex = contents.findIndex(se => se.verse === gap)
              debug(`Processing gap ${gap} ...`)
              debug(`gapIndex is ${gapIndex}`)
              let candidates = []
              if (gapIndex > 0 && gapIndex < 10) {
                // mark beginning of page up to gap as transposition, if there are no other transpositions already
                candidates = contents.slice(0, gapIndex)
                debug(`Candidates for start area ${page}: ${candidates.join(', ')}`)
              } else if (gapIndex > contents.length - 10) {
                // mark gap to ending of page as transposition, if there are no other transpositions already
                candidates = contents.slice(gapIndex, contents.length)
                debug(`Candidates for end area ${page} - contents.slice(${gapIndex}, ${contents.length}): ${candidates.join(', ')}`)
              }
              const alreadyContainsTransposition = candidates.some(c => c.transpositionPart)
              debug(`Area already contains a transposition: ${alreadyContainsTransposition}`)
              if (candidates[0] && !alreadyContainsTransposition) {
                debug(`Starting to mark transpositions...`)
                for (let j = candidates.length - 1; j >= 0; j--) {
                  debug(`Marking candidates[${j}] as a transposition part`)
                  candidates[j].transpositionPart = true
                }
                candidates[0].transpositionStart = true
                candidates[0].transpositionRowSpan = candidates.length
                debug(`Transposition marking ended...`)
              }
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
      if (this.$el) {
        const active = this.$el.querySelector('th.is-active')
        if (!active) return

        scroll(active, 500, {
          container: this.$el,
          offset: -this.$el.offsetHeight / 3,
          force: true
        })
      }
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
