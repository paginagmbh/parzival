import Vue from 'vue'
import App from './App.vue'
import router from './router'

import MQ from 'vue-match-media'
import VueLazyload from 'vue-lazyload'
import VueWaypoint from 'vue-waypoint'
import { focus } from 'vue-focus'

import ActivationMixin from '@/mixins/activation'
import ImagesMixin from '@/mixins/images'
import ManuscriptMixin from '@/mixins/manuscript'

import Container from '@/components/Container.vue'
import FacsimileViewer from '@/components/FacsimileViewer.vue'
import Pagination from '@/components/Pagination.vue'

import '@/assets/sass/app.scss'

Vue.use(MQ)
Vue.use(VueLazyload)
Vue.use(VueWaypoint)

Vue.directive('focus', focus)

Vue.mixin(ActivationMixin)
Vue.mixin(ImagesMixin)
Vue.mixin(ManuscriptMixin)

Vue.component('container', Container)
Vue.component('facsimile-viewer', FacsimileViewer)
Vue.component('pagination', Pagination)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  data: {
    title: 'Nuwer Parzifal'
  },
  mq: {
    mobile: '(max-width: 768px)',
    tablet: '(min-width: 769px)',
    touch: '(max-width: 1087px)',
    desktop: '(min-width: 1088px)',
    widescreen: '(min-width: 1280px)',
    fullhd: '(min-width: 1472px)'
  },
  watch: {
    title () {
      this.updateTitle()
    }
  },
  mounted () {
    this.updateTitle()
  },
  methods: {
    updateTitle () {
      document.title = this.title
    }
  }
}).$mount('#app')
