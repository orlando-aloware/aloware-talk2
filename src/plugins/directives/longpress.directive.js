import { Platform } from 'quasar'

export default () => ({
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
