<template>
  <video-modal class="pl-2"
               :title="routeTutorialData.title"
               :cookie-name="routeTutorialData.cookieName"
               :notes="routeTutorialData.notes"
               :video-url="routeTutorialData.videoUrl"
               :learn-more-link="routeTutorialData.learnMoreLink"
               v-if="isCompanyKYC && doesRouteHasTutorial"/>
</template>

<script>
import { mapGetters } from 'vuex'
import VideoModal from './video-modal.vue'

export default {
  name: 'tutorial-video-button',

  components: {
    VideoModal
  },

  computed: {
    ...mapGetters('auth', [
      'isCompanyKYC'
    ]),

    doesRouteHasTutorial () {
      return [
        'Inbox',
        'Wallboard',
        'Broadcasts'
        // 'Tags'
      ].includes(this.$route.name)
    },

    routeTutorialData () {
      const data = {
        'Inbox': {
          title: '📞 Explore Aloware Talk | Your Complete Guide',
          cookieName: 'inbox',
          videoUrl: 'https://www.youtube.com/embed/OmBIUrq-HC4?si=_74OeNHYRSssrfYR',
          learnMoreLink: 'https://support.aloware.com/en/articles/6637395-aloware-talk-basics',
          notes: '🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊'
        },
        'Wallboard': {
          title: '🚀 Mastering Aloware Wallboard: Elevate Your Contact Center Insights',
          cookieName: 'wallboard',
          videoUrl: 'https://www.youtube.com/embed/D2w_cctKdzo?si=col2kI_PNMXjZSjj',
          learnMoreLink: 'https://support.aloware.com/en/articles/5743991-sentry-mode-barge-whisper-in-admin',
          notes: '🚀 Amplify your insights with <strong>Aloware Wallboard!</strong> </br></br> 🌟 Visualize, track, and dominate. Dive into real-time data like never before. </br></br> Your dashboard revolution starts here!'
        },
        'Broadcasts': {
          title: 'Master Bulk SMS with Aloware Broadcast 💬',
          cookieName: 'broadcasts4',
          videoUrl: 'https://www.youtube.com/embed/nSAAyHLAnk4?si=PW_Mod_FJtO8jcFY',
          learnMoreLink: null,
          notes: 'Dive deep into Aloware\'s Bulk SMS feature, perfect for boosting your marketing campaigns.#SuperchargeYourOutreach. </br></br> 📱 Explore the power of Aloware\'s Bulk SMS Broadcast: a game-changer for your marketing strategies.'
        }
        // 'Tags': {
        //   title: '',
        //   cookieName: 'tags',
        //   videoUrl: '',
        //   learnMoreLink: 'https://support.aloware.com/en/articles/8234361-tags-in-aloware-talk-organize-your-contacts-with-ease',
        //   notes: '🌟 <strong>Tags</strong> = Your Ultimate Categorizer! </br></br> 🌟 Like Lists, but leveled up! Place the same person everywhere. </br></br> Bonus? Enroll a whole Tag audience in a sequence. </br></br> Plus, new contacts? They flash in with a fresh tag stamped with their upload date. 🚀'
        // }
      }

      return data[this.$route.name]
    }
  }
}
</script>
