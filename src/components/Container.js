import scrollIntoView from 'scroll-into-view'
import TranscriptInfo from './TranscriptInfo'
import * as v from '../lib/verse'
import { search, searchVerse, searchPage } from '../lib/search'

import metadata from '../data/metadata.json'
import transcript from '../data/transcript.json'

/* const excludedVerses = [
  ['NP 2000', 'NP 7999'],
  ['NP 10000', 'NP 10999'],
  ['NP 12000', 'NP 14999'],
  ['NP 15208', 'NP 25999']
].map(([start, end]) => ({ start: v.parse(start), end: v.parse(end) }))

const excludedVerse = (verse) => excludedVerses.some(
  i => (v.compare(i.start, verse) <= 0) && (v.compare(verse, i.end) <= 0)
) */

const excludedVerse = (verse) => false

export default {
  name: 'container',
  props: ['manuscript', 'pages', 'verse'],
  components: {
    TranscriptInfo
  },
  data: () => ({
    overviewModal: false,
    searchModal: false,
    query: '',
    notFound: false,
    info: false,
    excludedVerses: require('@/data/excluded-verses').excludedVerses,
    routingFromSearch: false,
    transcriptDocModal: false
  }),

  metaInfo () {
    return { title: [this.pageTitle, this.manuscriptTitle].join(', ') }
  },

  computed: {
    excludedVersesDisplayForm () {
      const fromTo = this.excludedVerses.map(v => v.join('-').replace(/\s/, '&nbsp;'))
      let displayForm = ''
      for (let i = 0; i < fromTo.length; i++) {
        if (i === fromTo.length - 1) {
          displayForm += ' und '
        } else if (i > 0 && i < fromTo.length - 1) {
          displayForm += ', '
        }
        displayForm += fromTo[i]
      }
      return displayForm
    },
    manuscriptPages () {
      const { manuscript } = this
      const { pages } = metadata.manuscripts[manuscript]
      return pages.map(page => {
        const verses = ['a', 'b']
          .some(c => transcript.verses[manuscript][`${page}${c}`])
        const src = this.thumb(manuscript, page)
        const key = [manuscript, page].join('_')
        const title = this.renderPageTitle([page]).replace(/^Bl\. /, '')
        return { page, verses, src, key, title }
      })
    }
  },

  methods: {
    pageRoute ({ page }) {
      return this.toPage(page)
    },

    transcriptClass ({ verses }) {
      return { available: verses }
    },

    activeSlide ({ page }) {
      return this.pageList.some(p => (page === p))
    },

    searchAll (e, fn = search) {
      const { query } = this
      const manuscript = metadata.manuscripts[this.manuscript]
      const column = transcript.columns[query]
      let result
      if (column && column[this.manuscript]) {
        result = {
          page: column[this.manuscript].column.replace(/[ab]$/, ''),
          verse: query
        }
      }
      // fallback search if we can't find the requested verse in the columns array
      if (!result || !result.page) {
        result = fn(manuscript, query)
      }
      this.$emit('search-for', query)
      this.routingFromSearch = true
      if (!result || (result.verse && excludedVerse(v.parse(result.verse)))) {
        this.notFound = true
        return
      }

      let { page, verse } = result
      this.notFound = false
      const to = this.toPage(page, this.manuscript, undefined, verse)

      if (!to.params.verse && to.name === 'synopsis') {
        this.notFound = true
        return
      }

      this.$router.push(to)
      this.toggle('searchModal')
      this.query = ''
    },

    searchVerse (e) {
      return this.searchAll(e, searchVerse)
    },

    searchPage (e) {
      return this.searchAll(e, searchPage)
    }
  },

  watch: {
    $route () {
      this.overviewModal = false
      this.searchModal = false
      this.info = false
      if (this.routingFromSearch) {
        this.routingFromSearch = false
      } else {
        this.$emit('search-for', '')
      }
    },

    overviewModal () {
      if (this.overviewModal) {
        this.$nextTick(
          () => scrollIntoView(this.$el.querySelector(
            '.parzival-overview .is-active'
          ))
        )
      }
    }
  }
}
