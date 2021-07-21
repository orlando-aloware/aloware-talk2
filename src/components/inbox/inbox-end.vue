<template>
<div class="inbox-end mx-3 mt-3 border-top-0 bg-transparent">
  <div class="inbox-info">
  </div>
</div>
</template>

<script>

export default {
  name: 'inbox-end.vue',
  components: {},
  data () {
    return {
      showContactInfo: false
    }
  },
  mounted () {
    this.$VueEvent.listen('toggle_contact_info', this.toggleContactInfo)
  },
  methods: {
    toggleContactInfo () {
      this.showContactInfo = !this.showContactInfo
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
</style>
