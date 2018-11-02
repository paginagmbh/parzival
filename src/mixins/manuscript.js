import { parsePageSigil, pageSigil } from '../lib/manuscript'
import quire from '../lib/quire'
import verse from '../lib/verse'

import metadata from '../data/metadata.json'
import transcript from '../data/transcript.json'

const pages = {
  single: {},
  double: {}
}

const sequences = {
  single: {},
  double: {}
}

for (const sigil in metadata.manuscripts) {
  const manuscript = metadata.manuscripts[sigil]
  for (const key of ['single', 'double']) {
    pages[key][sigil] = []
    sequences[key][sigil] = {}
  }
  for (let pi = 0, pl = manuscript.pages.length; pi < pl; pi++) {
    const page = manuscript.pages[pi]
    sequences.single[sigil][page] = pages.single[sigil].length
    pages.single[sigil].push(page)
  }

  const leafs = quire.leafs(manuscript.pages.map(parsePageSigil))
  for (let li = 0, ll = leafs.length; li < ll; li++) {
    const leaf = leafs[li].map(l => l ? pageSigil(l) : '').join(',')
    for (let page of leafs[li]) {
      if (!page) {
        continue
      }
      sequences.double[sigil][pageSigil(page)] = pages.double[sigil].length
      pages.double[sigil].push(leaf)
    }
  }
}

export default {
  computed: {
    pageList () {
      const pages = this.pages || ''
      if (pages === '') {
        return []
      }
      return pages.toLowerCase().split(/,\s*/g)
    },

    page () {
      return this.pageList.find(p => p)
    },

    hasTranscript () {
      const columns = transcript[this.manuscript || ''] || {}
      for (const page of this.pageList) {
        for (const column of ['a', 'b']) {
          if (columns[`${page}${column}`]) {
            return true
          }
        }
      }
      return false
    },

    manuscriptTitle () {
      return metadata.manuscripts[this.manuscript].title
    },

    pageTitle () {
      return 'Bl. ' + this.pageList.filter(p => p).join(',')
    },

    verseTitle () {
      const { columns } = metadata.manuscripts[this.manuscript]
      let start
      let end
      for (const page of this.pageList) {
        if (page) {
          for (const column of ['a', 'b']) {
            const sigil = `${page}${column}`
            if (sigil in columns) {
              const verses = columns[sigil]
              start = start || verses.start
              end = verses.end
            }
          }
        }
      }
      if (!start || !end) return ''
      return [verse.toString(start), verse.toString(end)].join('-')
    },

    otherManuscript () {
      return this.manuscript === 'V' ? 'VV' : 'V'
    },

    otherPages () {
      const { verse, otherManuscript } = this
      if (!verse) return undefined
      return ((this.collation()[verse] || {})[otherManuscript] || '')
        .replace(/[ab]$/, '') || ''
    },

    routes () {
      const manuscripts = {
        V: this.toPage('001r', 'V'),
        VV: this.toPage('001r', 'VV')
      }

      let otherManuscript = manuscripts[this.otherManuscript]
      if (this.otherPages) {
        const route = this.toPage(this.otherPages, this.otherManuscript)
        const verse = this.verse || route.params.verse
        otherManuscript = { ...route, params: { ...route.params, verse } }
      }
      return {
        manuscripts,

        otherManuscript,

        prevPage: this.prevPage(this.toPage()),

        nextPage: this.nextPage(this.toPage()),

        transcript: {
          ...this.toPage(null, null, 1),
          name: 'transcript'
        },

        synopsis: {
          ...this.toPage(null, null, 1),
          name: 'synopsis'
        },

        doublePage: {
          ...this.toPage(null, null, 2),
          name: 'facsimile'
        },

        singlePage: {
          ...this.toPage(null, null, 1),
          name: 'facsimile'
        }
      }
    }
  },

  methods: {
    metadata () {
      return metadata
    },

    transcript () {
      return transcript.transcript
    },

    collation () {
      return transcript.collation
    },

    nextPage (route) {
      const { manuscript, page } = this
      const count = Math.min(2, this.pageList.length)
      const key = count === 2 ? 'double' : 'single'
      const { length } = pages[key][manuscript]
      const index = Math.min(
        sequences[key][manuscript][page] + count,
        length - 1
      )
      const next = pages[key][manuscript][index]
      const verse = this.firstVerse(next.replace(/,.+$/, ''), manuscript)
      return { ...route, params: { ...route.params, pages: next, verse } }
    },

    prevPage (route) {
      const { manuscript, page } = this
      const count = Math.min(2, this.pageList.length)
      const key = count === 2 ? 'double' : 'single'
      const index = Math.max(0, sequences[key][manuscript][page] - count)
      const prev = pages[key][manuscript][index]
      const verse = this.firstVerse(prev.replace(/,.+$/, ''), manuscript)
      return { ...route, params: { ...route.params, pages: prev, verse } }
    },

    toPage (page, manuscript, count) {
      const { name, query, params } = this.$route
      manuscript = manuscript || params.manuscript || this.manuscript
      page = page || this.page

      const verse = this.firstVerse(page, manuscript, this.verse)

      count = count || this.pageList.length
      switch (count) {
        case 2:
          page = pages.double[manuscript][sequences.double[manuscript][page]]
          break
        case 1:
        default:
          page = pages.single[manuscript][sequences.single[manuscript][page]]
          break
      }

      return { name, query, params: { ...params, manuscript, pages: page, verse } }
    },

    firstVerse (page, manuscript, verse) {
      let candidate
      for (const columnSigil of ['a', 'b']) {
        const column = `${page}${columnSigil}`
        const verses = this.transcript()[manuscript][column]
        if (!verses) continue
        for (const v of verses) {
          candidate = candidate || v.verse
          if (v.verse === verse) {
            return verse
          }
        }
      }
      return candidate
    }
  }
}
