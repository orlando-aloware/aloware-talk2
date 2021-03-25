<template>
  <div>
    <div class="call-active">
      <call-active name="May Kerr" time="00:00"/>
    </div>
    <div class="inbox animate__animated animate__fadeIn">
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
import CallActive from 'components/inbox/call-active/call-active'

export default {
  components: {
    CallActive,
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
