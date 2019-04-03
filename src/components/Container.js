import scrollIntoView from 'scroll-into-view'

import * as v from '../lib/verse'
import { search, searchVerse, searchPage } from '../lib/search'

import metadata from '../data/metadata.json'
import transcript from '../data/transcript.json'

const excludedVerses = [
  ['NP 2000', 'NP 7999'],
  ['NP 10000', 'NP 10999'],
  ['NP 12000', 'NP 14999'],
  ['NP 15208', 'NP 25999']
].map(([start, end]) => ({ start: v.parse(start), end: v.parse(end) }))

const excludedVerse = (verse) => excludedVerses.some(
  i => (v.compare(i.start, verse) <= 0) && (v.compare(verse, i.end) <= 0)
)

export default {
  name: 'container',
  props: ['manuscript', 'pages', 'verse'],

  data: () => ({
    overviewModal: false,
    searchModal: false,
    query: '',
    notFound: false,
    info: false
  }),

  metaInfo () {
    return { title: [this.pageTitle, this.manuscriptTitle].join(', ') }
  },

  computed: {
    manuscriptPages () {
      const { manuscript } = this
      const { pages } = metadata.manuscripts[manuscript]
      return pages.map(page => {
        const verses = ['a', 'b']
          .some(c => transcript.verses[manuscript][`${page}${c}`])
        const src = this.thumb(manuscript, page)
        const key = [manuscript, page].join('_')
        return { page, verses, src, key }
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
      const result = fn(manuscript, query)
      if (!result || excludedVerse(v.parse(result.verse))) {
        this.notFound = true
        return
      }

      const { page, verse } = result
      this.notFound = false
      this.$router.push(this.toPage(page, this.manuscript, undefined, verse))
      this.toggle('searchModal')

    },

    searchVerse (e) {
      return this.search(e, searchVerse)
    },

    searchPage (e) {
      return this.search(e, searchPage)
    }
  },

  watch: {
    $route () {
      this.overviewModal = false
      this.searchModal = false
      this.info = false
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
