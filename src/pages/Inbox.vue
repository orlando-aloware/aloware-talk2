<template>
  <div class="h-100"
       v-if="authenticated">
    <!--div class="call-active">
    </div-->
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side :class="{ 'mobile-contact-active' : isMobileContactActive }"></inbox-side>
      <div class="inbox-details d-flex flex-grow-1"
           :class="{ 'mobile-contact-active' : isMobileContactActive }"
           v-if="['Inbox Contact', 'Inbox Contact Task', 'Inbox Contact Mention Communication'].includes($route.name)">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import InboxSide from 'components/inbox/inbox-side'
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import contactMixins from 'src/plugins/mixins/contact.mixin'

export default {
  mixins: [contactMixins],

  components: { InboxSide },

  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapState('inbox', ['items', 'activeChannel']),

    isMobileContactActive () {
      const selectedContact = _.get(this.contact, 'id', null)
      return selectedContact !== null
    }
  },

  data () {
    return {
      contactInfoOpen: false,
      title: 'Inbox',
      contactId: null,
      miniState: true
    }
  },

  methods: {
    ...mapActions('inbox', ['setActiveChannel', 'setTaskCount']),

    setChannel () {
      if (['Inbox Channel', 'Inbox Contact', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Mention Communication'].includes(this.$route.name)) {
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
    if (this.authenticated) {
      this.setChannel()
      this.fetchTaskCounts()
    }
  },

  watch: {
    '$route.name': function () {
      this.setChannel()
    }
  }
}
</script>
