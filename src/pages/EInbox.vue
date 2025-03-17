<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="einbox animate__animated animate__fadeIn position-relative">
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
import { EINBOXES_MENU_COMMUNICATIONS_TITLE } from 'src/router/routes'

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
        EINBOXES_MENU_COMMUNICATIONS_TITLE
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

<style scoped>
.einbox {
  height: 100%;
  width: 100%;
  display: flex
}
</style>
