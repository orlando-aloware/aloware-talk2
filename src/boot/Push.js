import Push from 'push.js'

window.Push = Push

export default async ({ Vue }) => {
  Vue.prototype.$Push = window.Push
}
