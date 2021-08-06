<template>
  <div class="h-100">
    <div class="call-active">
    </div>
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side></inbox-side>
      <div class="d-flex flex-grow-1">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'

export default {
  components: {
    InboxSide

  },

  data () {
    return {
      contactInfoOpen: false,
      title: 'Inbox',
      contactId: null
    }
  },

  methods: {
    toggleContactInfo () {
      this.contactInfoOpen = !this.contactInfoOpen
    }
  }
}
</script>
