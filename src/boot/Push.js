import Vue from 'vue'
import Push from 'push.js'

window.Push = Push

Vue.prototype.$Push = window.Push
