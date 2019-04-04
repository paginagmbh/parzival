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

const sigil = (manuscript) => manuscript === 'VV' ? 'V\'' : manuscript

const quireType2Name = {
  'L1': 'Unio',
  'L2': 'Binio',
  'L3': 'Ternio',
  'L4': 'Quaternio',
  'L5': 'Quinternio',
  'L6': 'Sexternio'
}

const page2Pages = (manuscript, page, count) => {
  switch (count) {
    case 2:
      return pages.double[manuscript][sequences.double[manuscript][page]]
    case 1:
    default:
      return pages.single[manuscript][sequences.single[manuscript][page]]
  }
}

const parsePages = (pages) => pages ? pages.toLowerCase().split(/,\s*/g) : []

export default {
  computed: {
    pageList () {
      return parsePages(this.pages)
    },

    page () {
      return this.pageList.find(p => p)
    },

    manuscriptSigil () {
      return sigil(this.manuscript)
    },

    manuscriptTitle () {
      return metadata.manuscripts[this.manuscript].title
    },

    pageTitle () {
      if (this.pageList.length === 0) return ''
      return 'Bl. ' + this.pageList.filter(p => p).map(this.numTitle).join(', ')
    },

    columns () {
      const { columns } = metadata.manuscripts[this.manuscript]
      const result = []
      for (const page of this.pageList) {
        if (page) {
          for (const column of ['a', 'b']) {
            const sigil = `${page}${column}`
            if (sigil in columns) {
              result.push(columns[sigil])
            }
          }
        }
      }
      return result
    },

    verseTitle () {
      let start
      let end
      for (const column of this.columns) {
        start = start || column.start
        end = column.end
      }
      if (!start || !end) return ''
      return [verse.toString(start), verse.toString(end)].join(' - ')
    },

    hands () {
      const hands = []
      for (const column of this.columns) {
        const { hand } = column
        if (!hand) continue
        if (hands.length > 0 && hands[0] === hand) continue
        hands.unshift(hand)
      }
      hands.reverse()
      return hands.length === 0 ? undefined : `Hand ${hands.join(' > ')}`
    },

    quires () {
      const { quires } = metadata.manuscripts[this.manuscript]
      const result = []
      for (const page of this.pageList) {
        if (page in quires) result.push(quires[page])
      }
      return result
    },

    uniqueQuires () {
      const unique = []
      for (const quire of this.quires) {
        if (unique.length > 0 && unique[0].num === quire.num) continue
        unique.unshift(quire)
      }
      unique.reverse()
      return unique
    },

    quireTitle () {
      const nums = this.uniqueQuires.map(({ num }) => num).join('/')
      const names = this.uniqueQuires.map(({ type }) => quireType2Name[type.substring(0, 2)] || type).join('/')
      return `${nums}) ${names}`
    },

    quireIconPath () {
      if (this.quires.length === 0) return undefined
      const [ quire ] = this.quires
      let quireIcon
      switch (this.pageList.length) {
        case 1:
          quireIcon = quire.singlePage
          break
        case 2:
          quireIcon = quire.doublePage
          break
      }
      return quireIcon ? `/quire-icons/${quireIcon}.gif` : quireIcon
    },

    otherManuscript () {
      return this.manuscript === 'V' ? 'VV' : 'V'
    },

    otherManuscriptSigil () {
      return sigil(this.otherManuscript)
    },

    otherManuscriptTitle () {
      return metadata.manuscripts[this.otherManuscript].title
    },

    otherPages () {
      const { verse, otherManuscript } = this
      if (!verse) return undefined
      return ((transcript.columns[verse] || {})[otherManuscript] || '')
        .replace(/[ab]$/, '') || ''
    },

    otherPageTitle () {
      if (!this.otherPages) return undefined
      return 'Bl. ' + this.numTitle(this.otherPages)
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

      const synopsis = this.toSynopsis(this.verse)

      return {
        manuscripts,

        otherManuscript,

        synopsis,

        prevPage: this.prevPage(this.toPage()),

        nextPage: this.nextPage(this.toPage()),

        introduction: {
          name: 'introduction'
        },

        transcript: this.toPerspective(
          this.toPage(null, null, 1),
          'transcript'
        ),

        doublePage: this.toPerspective(
          this.toPage(null, null, 2),
          'facsimile'
        ),

        singlePage: this.toPerspective(
          this.toPage(null, null, 1),
          'facsimile'
        )
      }
    }
  },

  methods: {

    toPerspective (route, name) {
      return route ? { ...route, name } : undefined
    },

    nextPage (route) {
      const { manuscript, page } = this
      if (!page) return undefined

      const count = Math.min(2, this.pageList.length)
      const key = count === 2 ? 'double' : 'single'
      const { length } = pages[key][manuscript]
      const index = Math.min(
        sequences[key][manuscript][page] + count,
        length - 1
      )
      const next = pages[key][manuscript][index]
      const found = this.firstVerse(next, manuscript)
      return {
        ...route,
        params: {
          ...route.params,
          pages: page2Pages(manuscript, found.page, count),
          verse: found.verse
        }
      }
    },

    prevPage (route) {
      const { manuscript, page } = this
      if (!page) return undefined

      const count = Math.min(2, this.pageList.length)
      const key = count === 2 ? 'double' : 'single'
      const index = Math.max(0, sequences[key][manuscript][page] - count)
      const prev = pages[key][manuscript][index]
      const found = this.firstVerse(prev, manuscript)
      return {
        ...route,
        params: {
          ...route.params,
          pages: page2Pages(manuscript, found.page, count),
          verse: found.verse
        }
      }
    },

    toPage (toPages, manuscript, count, verse) {
      toPages = toPages || this.pages
      if (!toPages) return undefined

      let { name, query, params } = this.$route
      manuscript = manuscript || params.manuscript || this.manuscript

      const found = this.firstVerse(toPages, manuscript, verse || this.verse)
      count = count || this.pageList.length

      params = {
        ...params,
        manuscript,
        pages: page2Pages(manuscript, found.page, count),
        verse: found.verse
      }
      return { name, query, params }
    },

    firstVerse (pages, manuscript, verse) {
      let pc
      let vc
      for (const page of parsePages(pages).filter(p => p)) {
        pc = pc || page
        for (const columnSigil of ['a', 'b']) {
          const column = `${page}${columnSigil}`
          const verses = transcript.verses[manuscript][column]
          if (!verses) continue
          for (const v of verses) {
            vc = vc || v
            if (v === verse) {
              return { page, verse }
            }
          }
        }
      }
      return { page: pc, verse: vc }
    },

    toVerse (verse, manuscript, count) {
      const { name, query, params } = this.$route
      manuscript = manuscript || params.manuscript || this.manuscript

      const column = (transcript.columns[verse] || {})[manuscript]
      if (!column) return undefined

      let page = column.replace(/[ab]$/, '')
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

    toSynopsis (verse) {
      return verse ? { name: 'synopsis', params: { verse } } : undefined
    },

    numTitle (number) {
      return number.replace(/^0*/, '')
    }
  }
}
