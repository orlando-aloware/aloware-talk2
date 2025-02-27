<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <e-inbox-side :class="inboxSideClasses"
                    @itemSelected="onItemSelected" />

      <div :class="['d-flex', 'flex-grow-1', { 'mobile-contact-active' : isMobileContactActive }]"
           v-if="isContactShow">
        <Contact />
      </div>
    </div>
  </div>
</template>

<script>
import Contact from 'pages/contacts/Contact'
import EInboxSide from 'components/einbox/einbox-side'
import { userMixin } from 'src/plugins/mixins'
import { mapGetters } from 'vuex'

export default {
  name: 'EInbox',

  mixins: [
    userMixin
  ],

  components: {
    Contact,
    EInboxSide
  },

  data () {
    return {
      mobileContactScreenRoutes: [
        'EInboxCommunicationDetail'
      ]
    }
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
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
    }
  },

  mounted () {
    // block direct access from non demo companies
    if (!this.isDemoCompany) {
      this.$router.push({ name: 'Inbox' })
    }
  },

  methods: {
    onItemSelected (routeData) {
      this.$router.push(routeData)
    }
  }
}
</script>
