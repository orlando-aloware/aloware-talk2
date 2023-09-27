export default {
  methods: {
    showIntercom () {
      if (window.Intercom) {
        window.Intercom('show')
      }
    }
  }
}
