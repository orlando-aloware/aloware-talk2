import { Platform } from 'quasar'

export default {
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
}
