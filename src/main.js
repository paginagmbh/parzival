import Vue from 'vue'
import App from './App.vue'
import router from './router'

import MQ from 'vue-match-media'
import VueMeta from 'vue-meta'
import VueLazyload from 'vue-lazyload'
import VueWaypoint from 'vue-waypoint'
import { focus } from 'vue-focus'
import VueScrollTo from 'vue-scrollto'

import ActivationMixin from '@/mixins/activation'
import ImagesMixin from '@/mixins/images'
import ManuscriptMixin from '@/mixins/manuscript'

import Container from '@/components/Container.vue'
import FacsimileViewer from '@/components/FacsimileViewer.vue'
import TranscriptViewer from '@/components/TranscriptViewer.vue'

import '@/assets/sass/app.scss'

require('intersection-observer');

Vue.use(MQ)
Vue.use(VueMeta)
Vue.use(VueLazyload)
Vue.use(VueWaypoint)
Vue.use(VueScrollTo)

Vue.directive('focus', focus)

Vue.mixin(ActivationMixin)
Vue.mixin(ImagesMixin)
Vue.mixin(ManuscriptMixin)

Vue.component('container', Container)
Vue.component('facsimile-viewer', FacsimileViewer)
Vue.component('transcript-viewer', TranscriptViewer)

Vue.config.productionTip = false

const title = 'Original und Kopie des ›Rappoltsteiner Parzifal‹'

new Vue({
  router,
  render: h => h(App),
  mq: {
    mobile: '(max-width: 768px)',
    tablet: '(min-width: 769px)',
    touch: '(max-width: 1087px)',
    desktop: '(min-width: 1088px)',
    widescreen: '(min-width: 1280px)',
    fullhd: '(min-width: 1472px)'
  },
  metaInfo () {
    return {
      title,
      titleTemplate: `%s | ${title}`,
      htmlAttrs: {
        lang: 'de'
      }
    }
  }
}).$mount('#app')
