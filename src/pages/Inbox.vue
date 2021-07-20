<template>
  <div class="pl-lg-5 ml-lg-2 q-px-xs-md">
    <div class="call-active">
    </div>
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side></inbox-side>
      <inbox-mid></inbox-mid>
      <inbox-end></inbox-end>
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'
import InboxMid from 'components/inbox/inbox-mid'
import InboxEnd from 'components/inbox/inbox-end'

export default {
  components: {
    InboxEnd,
    InboxSide,
    InboxMid
  },
  methods: {
    toggleContactInfo () {
      this.contactInfoOpen = !this.contactInfoOpen
    }
  },
  data () {
    return {
      contactInfoOpen: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.call-active {
  margin-bottom: 15px;
  @include screen('lg') {
    display: none;
  }
}

.inbox {
  height: calc(100vh - 215px);
  max-height: calc(100vh - 215px);
  width: 100%;
  display: flex;
  gap: 20px;

  @include screen('md') {
    min-height: calc(100vh - 130px);
    max-height: calc(100vh - 130px);
  }

  @include screen('lg') {
    min-height: calc(100vh - 100px);
    max-height: calc(100vh - 100px);
  }
}
</style>
