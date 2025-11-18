import { get } from 'lodash'
import * as storage from 'src/plugins/helpers/storage'
import Vue from 'vue'
import VueGtagEsm from 'vue-gtag'
import VueRouter from 'vue-router'
import routes, { TEAMINBOXES_MENU_TITLE } from './routes'

// Override Vue Router's push method to handle navigation duplications gracefully
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => {
    // Only ignore NavigationDuplicated errors, rethrow others
    if (err.name !== 'NavigationDuplicated') {
      throw err
    }
    // Return a resolved promise for the current location
    return Promise.resolve(this.currentRoute)
  })
}

Vue.use(VueRouter)

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
    // Redirect old legacy inbox paths
    // Note: This handles old URLs that might still be accessed via direct links
    const isBasePath = ['/', ''].includes(to.path)
    const isLegacyInboxPath = isBasePath || to.path.startsWith('/channels')

    if (isLegacyInboxPath) {
      const { id: contactId, communicationId, channel } = { ...to.params, ...to.query }

      if (contactId) {
        const routeChannel = channel === 'mentions' ? 'mentions' : 'communications'
        const contactRoute = !communicationId
          ? `/contacts/${contactId}`
          : `/contacts/${contactId}/${routeChannel}/${communicationId}`

        next(contactRoute)
        return
      }

      next({ name: TEAMINBOXES_MENU_TITLE })
      return
    }

    next()
    const isWidget = to.matched.some(route => route?.meta?.isWidget)

    if (isWidget) {
      store.commit('SET_IS_WIDGET', true)
    }

    const isSalesforceWidget = to.matched.some(route => route?.meta?.isSalesforceWidget)

    if (isSalesforceWidget) {
      store.commit('SET_IS_SALESFORCE_WIDGET', true)
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

  Router.onError(error => {
    console.error(error)
    if (/ChunkLoadError:.*failed./i.test(error.message)) {
      console.error('Reloading Window 1')
      window.location.reload()
    } else if (/Loading.*chunk.*failed./i.test(error.message)) {
      console.error('Reloading Window 2')
      window.location.reload()
    }
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
  })

  if (process.env.APP_ENV === 'production' && process.env.GA_TRACKING_ID) {
    Vue.use(VueGtagEsm, {
      config: {
        id: process.env.GA_TRACKING_ID
      }
    }, Router)
  }

  return Router
}
