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
                     videoUrl="https://www.youtube.com/embed/1YjuDUF53iQ?si=iO3kICM1p_mFXX0J"
                     learnMoreLink="https://support.aloware.com/logging-in-to-aloware-talk-a-step-by-step-guide-for-agents"
                     notes="🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊"
                     :should-show-default-activator="false"
                     :should-show-in-first-visit="false"
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
                     videoUrl="https://www.youtube.com/embed/1YjuDUF53iQ?si=iO3kICM1p_mFXX0J"
                     learnMoreLink="https://support.aloware.com/logging-in-to-aloware-talk-a-step-by-step-guide-for-agents"
                     notes="🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊"
                     :should-show-default-activator="false"
                     :should-show-in-first-visit="false"
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
               v-if="isCompanyKYC && !kycFilled"
               @click="onOpenFinishRegistration" />
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
import { simpsocialMixin } from 'src/plugins/mixins'
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
    simpsocialMixin
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

    ...mapGetters('auth', ['isTrial', 'isCompanyKYC']),

    kycFilled () {
      return this.profile?.company?.kyc_filled
    },

    trialText () {
      const dayNoun = this.currentCompany.trial_remaining_days > 1 ? 'days' : 'day'
      return `Welcome, ${this.profile.first_name}, you have ${this.currentCompany.trial_remaining_days} ${dayNoun} left until your ${this.currentCompany.trial_days}-day trial account expires.`
    },

    isBigScreen () {
      return this.$q.screen.width > 1280
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
