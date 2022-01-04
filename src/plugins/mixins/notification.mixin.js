import { mapState } from 'vuex'

export default {
  data () {
    return {
      notificationAudio: new Audio(process.env.API_URL + '/static/ivr/default-communication-notification.mp3')
    }
  },

  computed: {
    ...mapState(['enableAudio'])
  },

  methods: {
    playAudio () {
      if (!this.enableAudio) {
        return
      }

      let promise = this.notificationAudio.play()

      if (promise !== undefined) {
        promise.catch(err => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
          console.log(err)
        })
      }
    }
  }
}
