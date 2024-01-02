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
        'Broadcasts',
        'Tags'
      ].includes(this.$route.name)
    },

    routeTutorialData () {
      const data = {
        'Inbox': {
          title: '📞 Explore Aloware Talk | Your Complete Guide',
          cookieName: 'inbox',
          videoUrl: 'https://www.youtube.com/embed/1YjuDUF53iQ?si=uJqAQe2WeqNIPJE6',
          learnMoreLink: 'https://support.aloware.com/logging-in-to-aloware-talk-a-step-by-step-guide-for-agents',
          notes: '🔥 Ignite your communication game with <strong>Aloware Talk!</strong> </br></br> 📞 Dive into seamless conversations, build stronger connections, and make every word count. </br></br> Amplify your talk experience now! 💥🔊'
        },
        'Contacts': {
          title: '📇 Unveil the Contacts Tab in Aloware!',
          cookieName: 'contacts',
          videoUrl: 'https://www.youtube.com/embed/U5l4PMXOpSM?si=sAnahiyuAASpWrP0',
          learnMoreLink: '',
          notes: 'Discover, organize, and optimize your network. </br></br>The Contacts Tab is your gateway to streamlined connections. </br></br>Delve in and direct your networking journey to triumph with every contact!'
        },
        'Wallboard': {
          title: '🚀 Mastering Aloware Wallboard: Elevate Your Contact Center Insights',
          cookieName: 'wallboard',
          videoUrl: 'https://www.youtube.com/embed/WU2R7haxbDQ?si=86mi9-Mmdz8E8Srv',
          learnMoreLink: 'https://support.aloware.com/introducing-aloware-wallboard-your-real-time-communication-metrics-dashboard',
          notes: '🚀 Amplify your insights with <strong>Aloware Wallboard!</strong> </br></br> 🌟 Visualize, track, and dominate. Dive into real-time data like never before. </br></br> Your dashboard revolution starts here!'
        },
        'Broadcasts': {
          title: 'Master Bulk SMS with Aloware Broadcast 💬',
          cookieName: 'broadcasts4',
          videoUrl: 'https://www.youtube.com/embed/nSAAyHLAnk4?si=PW_Mod_FJtO8jcFY',
          learnMoreLink: 'https://support.aloware.com/exploring-aloware-talks-broadcast',
          notes: 'Dive deep into Aloware\'s Bulk SMS feature, perfect for boosting your marketing campaigns.#SuperchargeYourOutreach. </br></br> 📱 Explore the power of Aloware\'s Bulk SMS Broadcast: a game-changer for your marketing strategies.'
        },
        'Tags': {
          title: '🏷️ Mastering Aloware Tags: Organize Your Contacts Effectively',
          cookieName: 'tags',
          videoUrl: 'https://www.youtube.com/embed/I68fcqIrW7E?si=QtbTTk2vzauPqpAd',
          learnMoreLink: 'https://support.aloware.com/tags-in-aloware-talk-organize-your-contacts-with-ease',
          notes: '🌟 <strong>Tags = Your Ultimate Categorizer! </br></br> 🌟 Like Lists, but leveled up! Place the same person everywhere. </br></br> Bonus? Enroll a whole Tag audience in a sequence. </br></br> Plus, new contacts? They flash in with a fresh tag stamped with their upload date. 🚀'
        },
        'Communication': {
          title: '📞 Embrace the Communications in Aloware! 🚀',
          cookieName: 'communication',
          videoUrl: 'https://www.youtube.com/embed/Ys8VmtVLbQI?si=Gy6OBY13JtwrQ9m9',
          learnMoreLink: '',
          notes: `Connect, converse, and conquer your business communications. </br></br>The Aloware Communications Tab is your command center for interaction excellence. </br></br>Click in and command your conversations to success!`
        }
      }

      return data[this.$route.name]
    }
  }
}
</script>
