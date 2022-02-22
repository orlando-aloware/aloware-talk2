export default () => ({
  bind: function (el, binding, vNode) {
    // Make sure expression provided is a function
    if (typeof binding.value !== 'function') {
      // Fetch name of component
      const compName = vNode.context.name
      // pass warning to console
      const warn = { data: `[longpress:] provided expression '${binding.expression}' is not a function, but has to be` }
      if (compName) {
        warn.data += `Found in component '${compName}' `
      }

      console.warn(warn.data)
    }

    // Define variable
    const pressTimer = { data: null }
    const isExecuted = { data: false }

    // Define function handlers
    // Create timeout ( run function after 1s )
    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return
      }

      if (pressTimer.data === null) {
        pressTimer.data = setTimeout(() => {
          isExecuted.data = true
          // Run long function
          binding.value(true)
        }, 500)
      }
    }

    // Cancel Timeout
    const cancel = (e) => {
      // Check if timer has a value or not
      if (pressTimer.data !== null) {
        clearTimeout(pressTimer.data)
        pressTimer.data = null
      }

      if (!isExecuted.data) {
        // Run short  function
        binding.value(false)
      }

      isExecuted.data = false
    }

    // Add Event listeners
    el.addEventListener('mousedown', start)
    // Cancel timeouts if this events happen
    el.addEventListener('click', cancel)
  }
})
