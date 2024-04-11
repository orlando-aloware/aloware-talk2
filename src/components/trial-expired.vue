<template>
  <div class="trial-banner">
    <div class="left-content">
      <p class="trial--text">{{ trialText }}</p>
      <div class="d-flex"
           v-if="true">
          <trial-expired-modal :is-open="true">
          </trial-expired-modal>
        <div class="button-index q-mr-lg demo--button"
            @click="openBookDemo">
          <img src="/icons/calendar.svg"/>
          <a href="https://meetings.hubspot.com/alwr/aloware-demo"
            target="_blank">
              Book a demo!
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { simpsocialMixin, kycMixin } from 'src/plugins/mixins'
import { mapActions, mapState, mapGetters } from 'vuex'
import TrialExpiredModal from 'src/components/trial-expired-modal.vue'

export default {
  name: 'TrialExpired',

  components: {
    TrialExpiredModal
  },

  mixins: [
    simpsocialMixin,
    kycMixin
  ],

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

    ...mapGetters('auth', ['isTrial']),

    trialText () {
      return 'HAMED_BTN'
      // if (typeof this.currentCompany.trial_remaining_days === 'undefined' || typeof this.currentCompany.trial_days === 'undefined') {
      //   return `Welcome, ${this.profile.first_name}, your account is on trial.`
      // }

      // const dayNoun = this.currentCompany.trial_remaining_days === 1 ? 'day' : 'days'
      // return `Welcome, ${this.profile.first_name}, you have ${this.currentCompany.trial_remaining_days} ${dayNoun} left until your ${this.currentCompany.trial_days}-day trial account expires.`
    },

    isBigScreen () {
      return this.$q.screen.width > 1280
    },

    classicUrlCompliancePage () {
      return process.env.API_URL + '/account?tab=compliance'
    }
  },

  methods: {
    ...mapActions(['setIsTrialBannerVisible']),

    closeBanner () {
      this.shouldShow = false
      this.setIsTrialBannerVisible(false)
    },

    openBookDemo () {
      window.open('https://meetings.hubspot.com/alwr/aloware-demo', '_blank')
    },

    onOpenFinishRegistration () {
      if (this.$router.currentRoute.name === 'Business Information') {
        return
      }

      this.$router.push({
        name: 'Business Information',
        params: { company_id: this.currentCompany.id }
      })
    },

    onOpenRegistrationInReview () {
      window.location.href = this.classicUrlCompliancePage
    },

    openWatchGuideVideo () {
      this.$refs.videoModal.openModal()
    }
  },

  mounted () {
    console.log('HAMED_BTN', this.currentCompany)
    this.$refs.trialExpiredModal.openModal()
    // if (this.isCompanyKYC) {
    //   this.setIsTrialBannerVisible(true)
    // }
  }
}
</script>
