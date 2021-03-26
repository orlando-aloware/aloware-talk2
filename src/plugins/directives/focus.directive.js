export default ({ Vue }) => ({
  inserted: function (el) {
    el.focus()
  },
  update: function (el) {
    Vue.nextTick(() => el.focus())
  }
})
