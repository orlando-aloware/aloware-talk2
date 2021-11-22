import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

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

export default function (/* { store, ssrContext } */) {
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
    let record = to.matched.find(record => record.meta.title)
    let documentTitle = ''
    if (record) {
      documentTitle = (record.meta.title || '')
    }
    document.title = documentTitle + ' - Aloware Talk'
  })

  return Router
}
