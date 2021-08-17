<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="call-active">
    </div>
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side></inbox-side>
      <div class="d-flex flex-grow-1"
           v-if="['Inbox Contact', 'Inbox Contact Task'].includes($route.name)">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import contactMixins from 'src/plugins/mixins/contact.mixin'

export default {
  mixins: [contactMixins],

  components: { InboxSide },

  computed: {
    ...mapGetters('auth', ['authenticated']),
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
    ...mapActions('inbox', ['setActiveChannel', 'setTaskCount']),

    setChannel () {
      if (['Inbox Channel', 'Inbox Contact'].includes(this.$route.name)) {
        let channel = this.items.find(item => item.value === this.$route.params.channel)
        this.setActiveChannel(channel)
      }

      if (['Inbox'].includes(this.$route.name) && !this.activeChannel) {
        let channel = this.items.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }
    },
    fetchTaskCounts () {
      return talk2Api.V2.contacts.inboxCounts().then(res => {
        this.setTaskCount({
          new: res.data.open,
          open: res.data.open,
          pending: res.data.pending,
          closed: res.data.closed
        })
      })
    }
  },

  created () {
    this.$VueEvent.listen('contact_task_status_updated', () => {
      this.fetchTaskCounts()
    })
  },

  mounted () {
    this.setChannel()
    this.fetchTaskCounts()
  },

  watch: {
    '$route.name': function () {
      this.setChannel()
    }
  }
}
</script>
