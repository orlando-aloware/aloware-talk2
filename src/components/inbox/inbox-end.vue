<template>
<div class="inbox-end">
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

.inbox-info {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.inbox-end {
  background-color: $white;
  border: solid 1px $grey-light3;
  position: relative;
  overflow: hidden;
  width: 100%;
  display: none;
  @include screen('lg') {
    width: 330px;
    display: flex;
  }
}
</style>
