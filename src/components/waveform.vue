<template>
  <div class="waveform-container d-flex align-items-center flex-row flex-grow-1" data-testid="waveform-wrapper">
    <button class="play-button mr-2 px-0"
            :disabled="!ready"
            data-testid="waveform-button"
            @click.prevent="handlePlay">
      <i class="fa fa-pause"
         v-if="playing"></i>
      <i class="fa fa-play"
         v-if="!playing"></i>
    </button>
    <div class="waveform flex-grow-1 mr-2"
         :id="'waveform-' + uniqueId">
        <div class="d-flex justify-center position-relative"
             v-if="loading">
          <q-spinner-bars color="success"
                        size="28px"
                        class="position-absolute"
                        data-testid="waveform-spinner-bars">
          </q-spinner-bars>
        </div>
      </div>
    <div class="waveform-timeline mr-1">
      <q-select
        dense
        emit-value
        borderless
        class="mt-2 q-select-pager"
        option-value="value"
        option-label="label"
        data-testid="waveform-select-payback-speed"
        @input="changePlaybackSpeed"
        v-model="playbackSpeed"
        :options="playbackOptions"
        :display-value="`${playbackSpeed}x`">
      </q-select>
    </div>
    <div class="waveform-timeline mr-2">
      <span class="text-xxs">{{ currentTime | fixDuration(true) }}/{{ duration | fixDuration(true) }}</span>
    </div>
    <vue-wave-surfer :src="remoteUrl"
                     :options="options"
                     ref="surf"
                     v-if="remoteUrl"
                     data-testid="waveform-wave-surfer">
    </vue-wave-surfer>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import * as WaveformPlaybackSpeedOptions from 'src/constants/waveform-playback-speed-options'

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
        backend: 'MediaElement',
        height: 40,
        progressColor: '#2D5BFF',
        responsive: true,
        waveColor: '#C9C9C9',
        cursorColor: '#2D5BFF'
      },
      playing: false,
      loading: true,
      ready: false,
      duration: 0,
      currentTime: 0,
      playbackSpeed: 1
    }
  },

  computed: {
    player () {
      if (this.$refs.surf) {
        return this.$refs.surf.waveSurfer
      }

      return null
    },
    playbackOptions () {
      return WaveformPlaybackSpeedOptions.PLAYBACK_SPEED_OPTIONS
    }
  },

  mounted () {
    if (this.player) {
      this.player.on('ready', () => {
        this.ready = true
        this.loading = false
        this.$emit('ready')
        this.duration = this.player.getDuration()
      })

      this.player.on('finish', () => {
        this.playing = false
      })

      this.player.on('audioprocess', () => {
        this.currentTime = this.player.getCurrentTime()
      })
    }
  },

  methods: {
    changePlaybackSpeed (speed) {
      this.player.setPlaybackRate(speed)
    },
    handlePlay () {
      this.playing = !this.playing
      if (this.player) {
        this.player.playPause()
      }
    }
  }
}
</script>
