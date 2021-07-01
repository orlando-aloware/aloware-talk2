<template>
  <div class="waveform-container"
       v-loading="!ready">
    <button class="play-button"
            :disabled="!ready"
            @click.prevent="handlePlay">
      <i class="fa fa-pause"
         v-show="playing"></i>
      <i class="fa fa-play"
         v-show="!playing"></i>
    </button>
    <div id="waveform"></div>
    <div class="waveform-timeline">
      <span class="text-xxs">{{ current_time | fixDuration }} / {{ duration | fixDuration }}</span>
    </div>
    <vue-wave-surfer ref="surf"
                     :src="remote_url"
                     :options="options">
    </vue-wave-surfer>
  </div>
</template>

<script>
import auth from 'boot/auth'
import { aclMixin } from 'src/plugins/mixins'
export default {
  name: 'waveform',

  mixins: [aclMixin],

  props: {
    remoteUrl: {
      required: true
    }
  },

  data () {
    return {
      auth: auth,
      options: {
        barRadius: 2,
        barWidth: 2,
        barGap: null,
        cursorWidth: 1,
        container: '#waveform',
        backend: 'WebAudio',
        height: 40,
        progressColor: '#2D5BFF',
        responsive: true,
        waveColor: '#EFEFEF',
        cursorColor: '#2D5BFF'
      },
      playing: false,
      ready: false,
      duration: 0,
      currentTime: 0
    }
  },

  computed: {
    player () {
      return this.$refs.surf.waveSurfer
    }
  },

  mounted () {
    this.player.on('ready', () => {
      this.ready = true
      this.duration = this.player.getDuration()
    })

    this.player.on('finish', () => {
      this.playing = false
    })

    this.player.on('audioprocess', () => {
      this.currentTime = this.player.getCurrentTime()
    })
  },

  methods: {
    handlePlay () {
      this.playing = !this.playing
      this.player.playPause()
    }
  }
}
</script>
