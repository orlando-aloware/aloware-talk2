export default {
  inserted: function (el) {
    el.focus()
  },
  update: function (el) {
    this.$nextTick(() => el.focus())
  }
}
