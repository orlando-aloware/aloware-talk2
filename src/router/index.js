import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import VueGtagEsm from 'vue-gtag'
Vue.use(VueRouter)
import * as storage from 'src/plugins/helpers/storage'
import { get } from 'lodash'
import Userpilot from 'userpilot'

// This listener will execute before router.beforeEach only if registered
// before vue-router is registered with Vue.use(VueRouter)

window.addEventListener('popstate', () => {
  window.VueEvent.fire('browser-pop')
})

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({
      x: 0,
      y: 0
    }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    next()
    const isWidget = to.matched.some(route => route?.meta?.isWidget)
    
    if (isWidget) {
        store.commit('SET_IS_WIDGET', true)
    }

    const record = to.matched.find(record => record.meta.title)
    const documentTitle = { data: '' }

    if (record) {
      documentTitle.data = (record.meta.title || '')
    }

    const statics = JSON.parse(storage.local.getItem('statics'))
    let staticName = get(statics, 'name', '')
    staticName = !staticName ? '' : staticName

    document.title = `${documentTitle.data} - ${staticName} Talk`
  })

  Router.afterEach((to, from) => {
    store.commit('SET_PREV_ROUTE', {
      fullPath: from.fullPath,
      name: from.name,
      path: from.path
    })
    store.commit('SET_CURRENT_ROUTE', {
      fullPath: to.fullPath,
      name: to.name,
      path: to.path
    })

    if (process.env.USERPILOT_APPTOKEN) {
      Userpilot.Userpilot.reload()
    }
  })

  if (process.env.APP_ENV === 'production') {
    Vue.use(VueGtagEsm, {
      config: {
        id: process.env.GA_TRACKING_ID
      }
    }, Router)
  }

  return Router
}
