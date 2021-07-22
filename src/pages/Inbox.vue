<template>
  <div class="h-100">
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
      contactInfoOpen: false,
      title: 'Inbox'
    }
  }
}
</script>
