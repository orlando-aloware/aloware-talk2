import Vue from 'vue'

window.VueEvent = new class {
  constructor () {
    this.vue = new Vue()
  }

  fire (event, data = null) {
    this.vue.$emit(event, data)
  }

  listen (event, callback) {
    this.vue.$on(event, callback)
  }

  unlisten (event, callback) {
    this.vue.$off(event, callback)
  }
}()

Vue.prototype.$VueEvent = window.VueEvent
