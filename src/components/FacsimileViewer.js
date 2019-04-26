import debounce from 'lodash.debounce'
import OpenSeadragon from 'openseadragon'

const viewportKey = 'parzival.facsimileViewport'
const defaultViewport = { x: 0, y: 0, width: 1, height: 0.5 }
const storeViewport = (viewport) => {
  sessionStorage[viewportKey] = JSON.stringify(viewport)
  return viewport
}
const storedViewport = () => {
  try {
    return JSON.parse(sessionStorage[viewportKey] || JSON.stringify(defaultViewport))
  } catch (e) {
    return defaultViewport
  }
}
export default {
  name: 'facsimile-viewer',
  props: ['manuscript', 'pages', 'numbered'],

  data () {
    return { viewport: storedViewport() }
  },

  methods: {
    openPages () {
      if (!this.osd) {
        return
      }
      this.imageOpen = false
      this.osd.close()

      const { manuscript, pageList, numbered } = this
      let { length } = pageList
      const width = 1 / length

      const success = () => {
        if (--length === 0) {
          let { x, y, width, height } = this.viewport
          x = Math.round((1 - (width || 1)) * 50) / 100
          y = 0

          this.imageOpen = true
          this.osd.viewport.fitBounds(
            new OpenSeadragon.Rect(x, y, width, height, 0),
            true
          )
          this.updateViewport()
        }
      }

      pageList.forEach((page, pi) => {
        if (page !== undefined) {
          this.osd.addTiledImage({
            tileSource: this.iiif(manuscript, page, numbered),
            width,
            x: (pi * width),
            success
          })
        }
      })
    },

    withOpenImage (fn) {
      const { osd, imageOpen } = this
      return osd ? fn(osd, imageOpen) : false
    },

    updateViewport () {
      this.withOpenImage(({ viewport }, imageOpen) => {
        if (!imageOpen) return

        viewport = viewport.getConstrainedBounds()

        const [x, y, width, height] = ['x', 'y', 'width', 'height']
          .map(k => (Math.round(viewport[k] * 100) / 100))

        this.viewport = { x, y, width, height }
      })
    },

    zoomIn () {
      this.withOpenImage(({ viewport }) => viewport.zoomBy(2))
    },

    zoomOut () {
      this.withOpenImage(({ viewport }) => viewport.zoomBy(0.5))
    },

    rotate (degrees) {
      this.withOpenImage(({ viewport }) => viewport.setRotation(
        viewport.getRotation() + degrees
      ))
    },

    rotateLeft () {
      this.rotate(-90)
    },

    rotateRight () {
      this.rotate(90)
    }

  },

  watch: {
    manuscript () {
      this.openPages()
    },

    pages () {
      this.openPages()
    },

    viewport () {
      storeViewport(this.viewport)
    }
  },

  created () {
    this.imageOpen = false
  },

  mounted () {
    const element = this.$el.querySelector('.parzival-facsimile')
    const osd = this.osd = OpenSeadragon({
      element,
      showNavigator: true,
      showNavigationControl: false,
      showRotationControl: false,
      navigatorPosition: 'TOP_LEFT',
      debugMode: false
    })

    osd.addHandler('viewport-change', debounce(
      this.updateViewport.bind(this), 50, { leading: true }
    ))

    this.openPages()
  },

  beforeDestroy () {
    if (this.osd) {
      this.osd.destroy()
    }
  }
}
