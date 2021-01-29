import linkify from 'vue-linkify'
import Cleave from 'cleave.js'
import { Platform } from 'quasar'

const cleave = {
  name: 'cleave',
  bind (el, binding) {
    const input = el.querySelector('input')
    input._vCleave = new Cleave(input, binding.value)
  },
  unbind (el) {
    const input = el.querySelector('input')
    input._vCleave.destroy()
  }
}

export default async ({ Vue }) => {
  Vue.directive('cleave', cleave)

  Vue.directive('focus', {
    inserted: function (el) {
      el.focus()
    },
    update: function (el) {
      Vue.nextTick(function () {
        el.focus()
      })
    }
  })

  Vue.directive('linkified', linkify)

  Vue.directive('holdpress', {
    bind: function (el, binding, vNode) {
      el.dataset.longPressTimeoutId = '0'
      let stop = (e) => {
        clearTimeout(parseInt(el.dataset.longPressTimeoutId))
        if (vNode.componentInstance) {
          vNode.componentInstance.$emit('holdpress-stop')
        } else {
          vNode.elm.dispatchEvent(new CustomEvent('holdpress-stop'))
        }
        if (Platform.is.cordova) {
          // Remove Event listeners
          document.removeEventListener('touchend', stop)
          document.removeEventListener('touchcancel', stop)
        } else {
          // Remove Event listeners
          document.removeEventListener('mouseup', stop)
        }
      }
      let start = (e) => {
        if (Platform.is.cordova) {
          // Add Event listeners
          document.addEventListener('touchend', stop)
          document.addEventListener('touchcancel', stop)
        } else {
          // Add Event listeners
          document.addEventListener('mouseup', stop)
        }
        let timeout = setTimeout(() => {
          if (vNode.componentInstance) {
            vNode.componentInstance.$emit('holdpress-start')
          } else {
            vNode.elm.dispatchEvent(new CustomEvent('holdpress-start'))
          }
        }, binding.value)
        el.dataset.longPressTimeoutId = timeout.toString()
      }
      el.$_long_press_pointerdown_handler = start
      if (Platform.is.cordova) {
        // Add Event listeners
        el.addEventListener('touchstart', start)
      } else {
        // Add Event listeners
        el.addEventListener('mousedown', start)
      }
    },
    unbind: function (el) {
      clearTimeout(parseInt(el.dataset.longPressTimeoutId))
      if (Platform.is.cordova) {
        // Remove Event listeners
        el.removeEventListener('touchstart', el.$_long_press_pointerdown_handler)
      } else {
        // Remove Event listeners
        el.removeEventListener('mousedown', el.$_long_press_pointerdown_handler)
      }
    }
  })

  Vue.directive('longpress', {
    bind: function (el, binding, vNode) {
      // Make sure expression provided is a function
      if (typeof binding.value !== 'function') {
        // Fetch name of component
        const compName = vNode.context.name
        // pass warning to console
        let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`
        if (compName) {
          warn += `Found in component '${compName}' `
        }

        console.warn(warn)
      }

      // Define variable
      let pressTimer = null
      let isExecuted = false

      // Define function handlers
      // Create timeout ( run function after 1s )
      let start = (e) => {
        if (e.type === 'click' && e.button !== 0) {
          return
        }

        if (pressTimer === null) {
          pressTimer = setTimeout(() => {
            isExecuted = true
            // Run long function
            binding.value(true)
          }, 500)
        }
      }

      // Cancel Timeout
      let cancel = (e) => {
        // Check if timer has a value or not
        if (pressTimer !== null) {
          clearTimeout(pressTimer)
          pressTimer = null
        }

        if (!isExecuted) {
          // Run short  function
          binding.value(false)
        }

        isExecuted = false
      }

      if (Platform.is.cordova) {
        // Add Event listeners
        el.addEventListener('touchstart', start)
        // Cancel timeouts if this events happen
        el.addEventListener('touchend', cancel)
        el.addEventListener('touchcancel', cancel)
      } else {
        // Add Event listeners
        el.addEventListener('mousedown', start)
        // Cancel timeouts if this events happen
        el.addEventListener('click', cancel)
      }
    }
  })
}
