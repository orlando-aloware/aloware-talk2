<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="teaminbox animate__animated animate__fadeIn position-relative">
      <TeamInboxSide :class="inboxSideClasses"
                    @itemSelected="onItemSelected" />

      <div :class="['d-flex', 'flex-grow-1', { 'mobile-contact-active' : isMobileContactActive }]"
           v-if="isContactShow">
        <Contact :team-inbox-id="activeInboxId"
                :team-inbox-unread-count="currentInboxUnreadCount" />
      </div>
    </div>
  </div>
</template>

<script>
import Contact from 'pages/contacts/Contact'
import TeamInboxSide from 'components/teaminbox/teaminbox-side'
import { userMixin } from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'
import { TEAMINBOXES_MENU_COMMUNICATIONS_TITLE } from 'src/router/routes'

export default {
  name: 'TeamInbox',

  mixins: [
    userMixin
  ],

  components: {
    Contact,
    TeamInboxSide
  },

  data () {
    return {
      mobileContactScreenRoutes: [
        TEAMINBOXES_MENU_COMMUNICATIONS_TITLE
      ]
    }
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('TeamInbox', [
      'activeInboxId',
      'activeInbox',
      'inboxesUnreadCount'
    ]),

    isMobileContactActive () {
      return this.mobileContactScreenRoutes.includes(this.$route.name)
    },

    isContactShow () {
      return this.mobileContactScreenRoutes.includes(this.$route.name)
    },

    inboxSideClasses () {
      return {
        'mobile-contact-active': this.isMobileContactActive
      }
    },

    currentInboxUnreadCount () {
      return this.getInboxUnreadCount(this.activeInboxId)
    }
  },

  mounted () {
    // block direct access from non demo companies
    if (!this.hasCompanyTeamInboxEnabled) {
      this.$router.push({ name: 'Inbox' })
    }
  },

  methods: {
    onItemSelected (routeData) {
      this.$router.push(routeData)
    },

    getInboxUnreadCount (inboxId) {
      return this.inboxesUnreadCount?.find((inbox) => inbox.ring_group_id === inboxId)?.unread_count || 0
    }
  }
}
</script>

<style scoped>
.teaminbox {
  height: 100%;
  width: 100%;
  display: flex;
  background-color: #F9F9FB;
}
</style>
