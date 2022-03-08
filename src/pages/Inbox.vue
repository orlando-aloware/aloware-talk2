<template>
  <div class="h-100"
       v-if="authenticated">
    <!--div class="call-active">
    </div-->
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side ref="inbox-side"
                  :class="inboxSideClasses">
      </inbox-side>
      <div class="inbox-details d-flex flex-grow-1"
           :class="{ 'mobile-contact-active' : isMobileContactActive }"
           v-if="isContactShow">
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
  name: 'inbox',

  mixins: [contactMixins],

  components: { InboxSide },

  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapState('inbox', ['items', 'activeChannel']),

    isMobileContactActive () {
      return ['Inbox Contact', 'Inbox Contact Task'].includes(this.$route.name)
    },

    isContactShow () {
      return ['Inbox Contact', 'Inbox Contact Task', 'Inbox Contact Mention Communication'].includes(this.$route.name)
    },

    inboxSideClasses () {
      return {
        'mobile-contact-active': this.isMobileContactActive,
        'inbox-side border-top-0 flex-shrink-0 h-100': this.$route.name === 'Inbox Channel'
      }
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

    setChannel (routeChanged = false) {
      if (['Inbox Channel', 'Inbox Contact', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Mention Communication'].includes(this.$route.name)) {
        const channel = this.items.find(item => item.value === this.$route.params.channel)
        this.setActiveChannel(channel)
      }

      if (['Inbox'].includes(this.$route.name) && !this.activeChannel) {
        const channel = this.items.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }

      if (routeChanged && this.$refs['inbox-side']) {
        this.$refs['inbox-side'].navigateToInbox()
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
    '$route.name': function (value) {
      this.setChannel(!value.includes('Inbox'))
    }
  }
}
</script>
