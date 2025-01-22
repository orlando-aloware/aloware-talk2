<template>
  <div class="d-flex flex-column flex-grow-1">
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
          <q-spinner-bars color="primary"
                          size="28px"
                          class="position-absolute"
                          data-testid="waveform-spinner-bars">
          </q-spinner-bars>
        </div>
      </div>
      <vue-wave-surfer :src="remoteUrl"
                       :options="options"
                       ref="surf"
                       v-if="remoteUrl"
                       data-testid="waveform-wave-surfer">
      </vue-wave-surfer>
    </div>
    <div class="d-flex flex-row align-items-center justify-content-between waveform-controls">
      <div class="waveform-timeline">
        <span class="text-xxs">{{ currentTime | fixDuration(true) }}/{{ duration | fixDuration(true) }}</span>
      </div>

      <div class="waveform-selector d-flex flex-row align-items-center">
        <span>Speed:</span>
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
    </div>

    <q-dialog ref="popupProxy"
              transition-show="scale"
              transition-hide="scale"
              anchor="bottom middle"
              self="top start"
              v-if="popupTarget"
              :target="popupTarget"
              no-parent-event>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-overline">Keywords Spotted - {{ selectedMessage.speaker }}</div>
          <div class="text-h5 q-mt-sm q-mb-xs">"{{ selectedAutoHighlight.text }}"</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="closePopup"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as WaveformPlaybackSpeedOptions from 'src/constants/waveform-playback-speed-options'
import { aclMixin } from 'src/plugins/mixins'
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

const regions = RegionsPlugin.create({
  regions: []
})

export default {
  name: 'waveform',

  mixins: [aclMixin],

  props: {
    remoteUrl: {
      required: true
    },

    uniqueId: {
      required: true
    },

    height: {
      type: Number,
      default: 40
    },

    splitChannels: {
      default: false
    },

    communication: {
      type: Object,
      required: false
    },

    messages: {
      type: Array,
      required: false
    }
  },

  data () {
    return {
      selectedAutoHighlight: null,
      selectedMessage: null,
      popupTarget: null,
      options: {
        barRadius: 2,
        barWidth: 2,
        barGap: null,
        cursorWidth: 1,
        container: '#waveform-' + this.uniqueId,
        backend: 'MediaElement',
        height: this.height,
        barHeight: 0.8,
        progressColor: '#2D5BFF',
        responsive: true,
        waveColor: '#C9C9C9',
        cursorColor: '#2D5BFF',
        splitChannels: this.splitChannels,
        plugins: [
          Hover.create({
            lineColor: '#ff0000',
            lineWidth: 2,
            labelBackground: '#555',
            labelColor: '#fff',
            labelSize: '11px'
          }),
          regions
        ]
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

        this.addRegions()
      })

      this.player.on('finish', () => {
        this.playing = false
      })

      this.player.on('audioprocess', () => {
        this.currentTime = this.player.getCurrentTime()
      })

      this.player.on('seeking', (currentTime) => {
        this.currentTime = currentTime
      })
    }
  },

  methods: {
    showPopup (triggerElement) {
      console.log(triggerElement)
      this.popupTarget = triggerElement
      this.$nextTick(() => {
        this.$refs.popupProxy.show(triggerElement) // Show popup relative to the element
      })
    },
    closePopup () {
      if (this.$refs.popupProxy) {
        this.$refs.popupProxy.hide() // Close the popup
      }
    },
    addRegions () {
      if (!this.messages) {
        return
      }

      for (let message of this.messages) {
        if (!message.auto_highlights) {
          continue
        }

        for (let autoHighlight of message.auto_highlights) {
          if (autoHighlight.start === undefined || autoHighlight.end === undefined) {
            continue
          }

          let channelIdx = 2
          let color = message.speaker === 'AGENT' ? 'rgb(200, 0, 200)' : 'rgb(0, 200, 200)'

          if (this.communication?.direction === CommunicationDirection.INBOUND && message.speaker === 'CONTACT') {
            channelIdx = 0
          }

          if (this.communication?.direction === CommunicationDirection.INBOUND && message.speaker === 'AGENT') {
            channelIdx = 1
          }

          if (this.communication?.direction === CommunicationDirection.OUTBOUND && message.speaker === 'AGENT') {
            channelIdx = 0
          }

          if (this.communication?.direction === CommunicationDirection.OUTBOUND && message.speaker === 'CONTACT') {
            channelIdx = 1
          }

          const region = regions.addRegion({
            start: autoHighlight.start / 1000,
            drag: false,
            resize: false,
            color: 'rgba(255, 255, 255, 0)',
            channelIdx: channelIdx
          })

          // HTML content
          const div = document.createElement('div')
          div.classList.add('region-' + message.speaker + '-' + this.communication?.direction)
          div.style.backgroundColor = color
          div.style.top = channelIdx === 0 ? '0px' : 'auto'
          div.style.bottom = channelIdx === 1 ? '0px' : 'auto'
          div.onclick = () => {
            this.selectedMessage = message
            this.selectedAutoHighlight = autoHighlight
            this.closePopup()
            this.showPopup(div)
          }

          region.setContent(div)
        }
      }
    },
    changePlaybackSpeed (speed) {
      this.player.setPlaybackRate(speed)
    },
    handlePlay () {
      this.playing = !this.playing
      if (this.player) {
        this.player.playPause()
      }
    },
    play () {
      if (this.player) {
        this.playing = true
        this.player.play()
      }
    },
    seekAudio (startTime) {
      if (this.player && this.ready) {
        this.player.setTime(startTime / 1000)
      }
    }
  },

  watch: {
    currentTime (newTime) {
      this.$emit('time-update', newTime)
    }
  }
}
</script>

<style scoped>
.waveform ::part(region-content) {
  position: absolute;
  content: '';
  display: inline-block;
  width: 5px;
  height: 5px;
  -moz-border-radius: 2.5px;
  -webkit-border-radius: 2.5px;
  border-radius: 2.5px;
  transform: translateX(-75%);
  cursor: pointer;
}
</style>
