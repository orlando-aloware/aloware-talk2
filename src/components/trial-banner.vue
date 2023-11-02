<template>
  <div class="trial-banner" v-if="!shouldShow">
    <div>
      <p class="trial--text">{{ trialText }}</p>
    </div>

    <div class="d-flex align-items-center">
      <p class="trial--text">Call Support: (855) 256-2001</p>
      <video-modal ref="videoModal"
                   title="📞 Explore Aloware Talk | Your Complete Guide"
                   cookieName="inbox"
                   videoUrl="https://www.youtube.com/embed/OmBIUrq-HC4?si=_74OeNHYRSssrfYR"
                   learnMoreLink="https://support.aloware.com/en/articles/6637395-aloware-talk-basics"
                   notes="🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊"
                   :should-show-default-activator="false">
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
      <div class="button-index">
        <q-btn class="q-mr-lg"
               color="primary"
               size="md"
               label="Finish Registration"
               rounded
               dense
               no-caps
               unelevated
               :disabled="kycFilled"
               @click="onOpenFinishRegistration" />
      </div>
      <div class="button-index">
        <compact-btn customClass="fs-24 _500 position-relative not-focusable q-ml-lg text-red-130"
                     borderless
                     @click="closeBanner">
          <i class="fs-24 fa fa-times cursor-pointer"
             :style="{ 'color': '#256EFF' }" />
        </compact-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import VideoModal from 'components/video-modal.vue'

export default {
  name: 'TrialBanner',

  components: {
    VideoModal
  },

  data () {
    return {
      shouldShow: false
    }
  },

  computed: {
    ...mapState('auth', [
      'profile',
      'authenticated'
    ]),

    ...mapState('cache', ['currentCompany']),

    kycFilled () {
      return this.profile?.company?.kyc_filled
    },

    trialText () {
      const dayNoun = this.currentCompany.trial_remaining_days > 1 ? 'days' : 'day'
      return `Welcome, ${this.profile.first_name}, you have ${this.currentCompany.trial_remaining_days} ${dayNoun} left until your ${this.currentCompany.trial_days}-day trial account expires.`
    }
  },

  methods: {
    calculateTrialDaysInfo (trialStartDate, trialEndDate) {
      if (!trialStartDate || !trialEndDate) {
        return { remainingDays: 0, totalTrialDays: 0 }
      }

      // Converting to ISO format
      trialStartDate = trialStartDate.replace(' ', 'T') + 'Z'
      trialEndDate = trialEndDate.replace(' ', 'T') + 'Z'

      const trialStart = new Date(trialStartDate)
      const trialEnd = new Date(trialEndDate)
      const today = new Date()

      if (trialStart > today) {
        const totalTrialTime = Math.abs(trialEnd - trialStart)
        const totalTrialDays = Math.ceil(totalTrialTime / (1000 * 60 * 60 * 24))
        return { remainingDays: totalTrialDays, totalTrialDays: totalTrialDays }
      }

      if (trialEnd < today) {
        return { remainingDays: 0, totalTrialDays: 0 }
      }

      const diffTime = Math.abs(trialEnd - today)
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const totalTrialTime = Math.abs(trialEnd - trialStart)
      const totalTrialDays = Math.ceil(totalTrialTime / (1000 * 60 * 60 * 24))

      return { remainingDays: remainingDays, totalTrialDays: totalTrialDays }
    },

    closeBanner () {
      this.shouldShow = true
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
  }
}
</script>
