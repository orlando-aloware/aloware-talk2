<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="call-active">
    </div>
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side></inbox-side>
      <div class="d-flex flex-grow-1"
           v-if="$route.name === 'Inbox Contact'">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  components: {
    InboxSide
  },

  computed: {
    ...mapState('inbox', ['items', 'activeChannel'])
  },

  data () {
    return {
      contactInfoOpen: false,
      title: 'Inbox',
      contactId: null
    }
  },

  methods: {
    ...mapGetters('auth', ['authenticated']),
    ...mapActions('inbox', ['setActiveChannel']),

    setChannel () {
      if (['Inbox Channel', 'Inbox Contact'].includes(this.$route.name)) {
        let channel = this.items.find(item => item.value === this.$route.params.channel)
        this.setActiveChannel(channel)
      }

      if (['Inbox'].includes(this.$route.name) && !this.activeChannel) {
        let channel = this.items.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }
    }
  },

  mounted () {
    this.setChannel()
  },

  watch: {
    '$route.name': function () {
      this.setChannel()
    }
  }
}
</script>
