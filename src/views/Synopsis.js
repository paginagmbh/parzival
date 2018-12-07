import v from '../lib/verse'
import transcript from '../data/transcript.json'

export default {
  name: 'synopsis',
  props: ['manuscript', 'pages', 'verse'],

  computed: {
    verses () {
      return Object.keys(transcript.html).map(v.parse).sort(v.compare).map(v.toString)
    }
  },

  methods: {
    html (verse, manuscript) {
      const columns = transcript.html[verse][manuscript] || {}
      return Object.keys(columns).sort()
            .map(column => columns[column])
            .join('') || '&ndash;'
    }
  }
}
