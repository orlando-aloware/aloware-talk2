<template>
<div class="inbox-end">
  <div class="inbox-info">
      <dialer v-if="!showContactInfo" ></dialer>
     <call-details-card v-if="showContactInfo" />
  </div>
</div>
</template>

<script>
import CallDetailsCard from 'components/inbox/call-details/call-details-card'
import Dialer from 'components/inbox/dialer/dialer'

export default {
  name: 'inbox-end.vue',
  components: { Dialer, CallDetailsCard },
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
  @include border-radius(10px);
  background-color: $white;
  border: solid 1px $grey-light3;
  position: relative;
  overflow: hidden;
  width: 100%;
  display: none;
  @include screen('lg') {
    width: 261px;
    display: flex;
  }
}
</style>
