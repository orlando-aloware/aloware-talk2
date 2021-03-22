<template>
  <div class="inbox">
    <inbox-side></inbox-side>
    <inbox-mid></inbox-mid>
    <inbox-end></inbox-end>
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
.inbox {
  max-height: calc(100vh - 170px);
  width: 100%;
  display: flex;
  gap: 20px;
  @include screen('lg') {
    min-height: calc(100vh - 100px);
  }
}
</style>
