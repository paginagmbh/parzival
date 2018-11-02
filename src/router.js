import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Facsimile from '@/views/Facsimile.vue'
import Synopsis from '@/views/Synopsis.vue'
import Transcript from '@/views/Transcript.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/',
      name: 'home',
      component: Home },

    { path: '/facsimile/:manuscript/:pages/:verse?',
      name: 'facsimile',
      component: Facsimile,
      props: true },

    { path: '/transcript/:manuscript/:pages/:verse?',
      name: 'transcript',
      component: Transcript,
      props: true },

    { path: '/synopsis/:manuscript/:pages/:verse?',
      name: 'synopsis',
      component: Synopsis,
      props: true },

    { path: '/introduction',
      name: 'introduction',
      component: () => import(
        /* webpackChunkName: "introduction" */ './views/Introduction.vue'
      ) },

    { path: '*',
      name: 'default',
      redirect: '/' }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
