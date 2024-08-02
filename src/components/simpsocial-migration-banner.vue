<template>
  <div class="trial-banner px-2 w-100 py-2 px-3 position-relative notification-container-header"
       v-if="shouldShow">
    <div class="left-content">
      <p class="trial--text">
        Over the coming weeks, PowerDialer, Calendar, Contacts, Broadcast, and the Phone will move to the new 'Talk' page. For questions, contact <a class="link-only" href="mailto:training@simpsocial.com">training@simpsocial.com</a>
      </p>
      <compact-btn customClass="fs-14 _500 position-relative not-focusable ml-2 text-red-130"
                   borderless
                   @clicked="closeBanner">
        <i class="fa fa-times"/>
      </compact-btn>
    </div>
  </div>
</template>

<script>
import { simpsocialMixin } from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'
import VueCookies from 'vue-cookies'
import CompactBtn from 'components/compact-btn'

export default {
  name: 'SimpsocialMigrationBanner',

  components: { CompactBtn },

  mixins: [
    simpsocialMixin
  ],

  props: {
    cookieName: {
      type: String,
      required: true
    },

    shouldShowInFirstVisit: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      shouldShow: true
    }
  },

  computed: {
    ...mapState('auth', [
      'profile',
      'authenticated'
    ]),

    ...mapState('cache', ['currentCompany']),

    parsedCookieName () {
      return `${this.cookieName}-${this.profile?.id}`
    }
  },

  methods: {
    ...mapActions(['setIsSimpsocialMigrationBannerVisible']),

    closeBanner () {
      this.shouldShow = false
      this.$cookies.set(this.parsedCookieName, 'viewed', 3650) // Set cookie to expire in 10 years
      this.setIsSimpsocialMigrationBannerVisible(false)
    }
  },

  created () {
    this.$cookies = VueCookies

    if (this.isSimpSocial && this.$cookies.get(this.parsedCookieName) && this.shouldShowInFirstVisit) {
      this.shouldShow = false
      this.setIsSimpsocialMigrationBannerVisible(false)
    }
  }
}
</script>
