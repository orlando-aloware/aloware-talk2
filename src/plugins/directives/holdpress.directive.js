export default () => ({
  bind: function (el, binding, vNode) {
    el.dataset.longPressTimeoutId = '0'
    const stop = (e) => {
      clearTimeout(parseInt(el.dataset.longPressTimeoutId))
      if (vNode.componentInstance) {
        vNode.componentInstance.$emit('holdpress-stop')
      } else {
        vNode.elm.dispatchEvent(new CustomEvent('holdpress-stop'))
      }
      // Remove Event listeners
      document.removeEventListener('mouseup', stop)
    }
    const start = (e) => {
      // Add Event listeners
      document.addEventListener('mouseup', stop)
      const timeout = setTimeout(() => {
        if (vNode.componentInstance) {
          vNode.componentInstance.$emit('holdpress-start')
        } else {
          vNode.elm.dispatchEvent(new CustomEvent('holdpress-start'))
        }
      }, binding.value)
      el.dataset.longPressTimeoutId = timeout.toString()
    }
    el.$_long_press_pointerdown_handler = start
    // Add Event listeners
    el.addEventListener('mousedown', start)
  },
  unbind: function (el) {
    clearTimeout(parseInt(el.dataset.longPressTimeoutId))
    // Remove Event listeners
    el.removeEventListener('mousedown', el.$_long_press_pointerdown_handler)
  }
})
