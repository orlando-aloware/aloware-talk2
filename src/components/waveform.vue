<template>
  <div class="waveform-container d-flex align-items-center flex-row flex-grow-1">
    <button class="play-button mr-2 px-0"
            :disabled="!ready"
            @click.prevent="handlePlay">
      <i class="fa fa-pause"
         v-if="playing"></i>
      <i class="fa fa-play"
         v-if="!playing"></i>
    </button>
    <div :id="'waveform-' + uniqueId"
         class="waveform flex-grow-1 mr-2"></div>
    <div class="waveform-timeline mr-2">
      <span class="text-xxs">{{ currentTime | fixDuration(true) }}/{{ duration | fixDuration(true) }}</span>
    </div>
    <vue-wave-surfer ref="surf"
                     :src="remoteUrl"
                     :options="options">
    </vue-wave-surfer>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'waveform',

  mixins: [aclMixin],

  props: {
    remoteUrl: {
      required: true
    },

    uniqueId: {
      required: true
    }
  },

  data () {
    return {
      options: {
        barRadius: 2,
        barWidth: 2,
        barGap: null,
        cursorWidth: 1,
        container: '#waveform-' + this.uniqueId,
        backend: 'WebAudio',
        height: 40,
        progressColor: '#2D5BFF',
        responsive: true,
        waveColor: '#C9C9C9',
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
      this.$emit('ready')
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
