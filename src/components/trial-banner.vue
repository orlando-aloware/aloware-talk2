<template>
  <div class="trial-banner"
       v-if="shouldShow">
    <div class="left-content">
      <p class="trial--text">{{ trialText }}</p>
      <div class="d-flex"
           v-if="!isBigScreen">
        <video-modal ref="videoModal"
                     title="📞 Welcome to Aloware Talk!"
                     cookieName="welcome"
                     videoUrl="https://www.youtube.com/embed/6CAkvtjJMBQ?si=5IzLiDNjjIarUr1m"
                     learnMoreLink="https://support.aloware.com/en/articles/9034164-logging-in-to-aloware-talk-a-step-by-step-guide-for-agents"
                     notes="🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊"
                     :should-show-default-activator="false"
                     :should-show-in-first-visit="true"
                     v-if="!isSimpSocial && isTrial">
          <template v-slot:activator>
            <div class="button-index q-mr-lg demo--button"
                @click="openWatchGuideVideo">
              <img src="/icons/film.svg"/>
              <a target="_blank"
                @click="openWatchGuideVideo">
                  Watch Guide Video
              </a>
            </div>
          </template>
        </video-modal>
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

    <div class="d-flex align-items-center">
      <div class="d-flex"
           v-if="isBigScreen">
        <video-modal ref="videoModal"
                     title="📞 Welcome to Aloware Talk!"
                     cookieName="welcome"
                     videoUrl="https://www.youtube.com/embed/6CAkvtjJMBQ?si=5IzLiDNjjIarUr1m"
                     learnMoreLink="https://support.aloware.com/en/articles/9034164-logging-in-to-aloware-talk-a-step-by-step-guide-for-agents"
                     notes="🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊"
                     :should-show-default-activator="false"
                     :should-show-in-first-visit="true"
                     v-if="!isSimpSocial && isTrial">
          <template v-slot:activator>
            <div class="button-index q-mr-lg demo--button"
                @click="openWatchGuideVideo">
              <img src="/icons/film.svg"/>
              <a target="_blank"
                @click="openWatchGuideVideo">
                  Watch Guide Video
              </a>
            </div>
          </template>
        </video-modal>
        <div class="button-index q-mr-lg demo--button"
            @click="openBookDemo">
          <img src="/icons/calendar.svg"/>
          <a href="https://meetings.hubspot.com/alwr/aloware-demo"
            target="_blank">
              Book a demo!
          </a>
        </div>
      </div>
      <div class="button-index">
        <q-btn class="q-mr-lg"
               color="primary"
               size="md"
               label="Unlock trial experience"
               rounded
               dense
               no-caps
               unelevated
               v-if="shouldShowUnlockTrialExperienceButton"
               @click="onOpenFinishRegistration" />
        <q-btn class="q-mr-lg"
               color="primary"
               size="md"
               label="Registration in Review"
               rounded
               dense
               no-caps
               unelevated
               v-if="shouldShowRegistrationInReviewButton"
               @click="onOpenRegistrationInReview" />
      </div>
      <div class="button-index">
        <compact-btn customClass="fs-24 _500 position-relative not-focusable text-red-130"
                     borderless
                     @clicked="closeBanner">
          <i class="fs-24 fa fa-times cursor-pointer"
             :style="{ 'color': '#256EFF' }" />
        </compact-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { classicMixin, simpsocialMixin, kycMixin } from 'src/plugins/mixins'
import { mapActions, mapState, mapGetters } from 'vuex'
import VideoModal from 'components/video-modal.vue'
import CompactBtn from 'components/compact-btn'

export default {
  name: 'TrialBanner',

  components: {
    VideoModal,
    CompactBtn
  },

  mixins: [
    classicMixin,
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
      if (typeof this.currentCompany.trial_remaining_days === 'undefined' || typeof this.currentCompany.trial_days === 'undefined') {
        return `Welcome, ${this.profile.first_name}, your account is on trial.`
      }

      const dayNoun = this.currentCompany.trial_remaining_days === 1 ? 'day' : 'days'
      return `Welcome, ${this.profile.first_name}, you have ${this.currentCompany.trial_remaining_days} ${dayNoun} left until your ${this.currentCompany.trial_days}-day trial account expires.`
    },

    isBigScreen () {
      return this.$q.screen.width > 1280
    },

    classicUrlCompliancePage () {
      return `${this.getClassicURL(this.isSimpSocial)}/account?tab=compliance`
    },

    shouldShowUnlockTrialExperienceButton () {
      return (this.isCompanyKYC && !this.isKYCFilled) || this.isCompanyA2pCampaignApproved
    },

    shouldShowRegistrationInReviewButton () {
      return (this.isCompanyKYC && !this.isKYCFilled) || !this.isCompanyA2pCampaignApproved
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

    onOpenRegistrationInReview () {
      window.location.href = this.classicUrlCompliancePage
    },

    openWatchGuideVideo () {
      this.$refs.videoModal.openModal()
    }
  },

  mounted () {
    if (this.isCompanyKYC) {
      this.setIsTrialBannerVisible(true)
    }
  }
}
</script>
