<template>
  <b-card header-tag="header"
          footer-tag="footer"
          title="Record an audio file"
  >
    <div v-if="!recordedAudio">
      <div class="text-center mt-4"
           v-if="!isRecording">
        <b-button pill
                  variant="light"
                  @click="startRecording">
          <i class="fa fa-microphone fa-2x"></i>
        </b-button>
        <b-card-text class="mt-2">Press to start recording</b-card-text>
      </div>

      <div class="text-center mt-4"
           v-else>
        <b-button pill
                  variant="danger"
                  :class="[isRecording ? 'recording' : '']"
                  @click="stopRecording">
          <i class="fa fa-microphone fa-2x"></i>
        </b-button>
        <b-card-text class="mt-2">{{ hours }}:{{ minutes }}:{{ seconds }}</b-card-text>
      </div>
    </div>

    <div v-else>
      <div class="text-center mt-4">
        <audio controls id="recorded">
          <source :src="recordedAudio.src">
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>

    <template #footer>
      <b-button size="sm"
                href="#"
                variant="primary"
                :disabled="isRecording"
                v-if="!recordedAudio && !isRecording"
                @click="startRecording">Start Recording</b-button>
      <b-button size="sm"
                href="#"
                variant="danger"
                :disabled="!isRecording"
                v-if="!recordedAudio && isRecording"
                @click="stopRecording">Stop Recording</b-button>
      <b-button size="sm"
                href="#"
                variant="primary"
                :disabled="isUploading"
                v-if="recordedAudio"
                @click="removeRecordedAudio">Change</b-button>

      <b-button class="ml-2"
                size="sm"
                href="#"
                variant="primary"
                :disabled="!recordedAudio || isUploading"
                v-if="recordedAudio"
                @click="uploadRecordedAudio">
        <q-spinner-bars class="mr-1"
                        color="white"
                        v-if="isUploading"/>
        <i class="fa fa-upload" v-else></i>
        {{ isUploading ? ' Uploading...' : 'Upload' }}
      </b-button>
    </template>
  </b-card>

</template>

<script>

import Microphone from '@gkt/microphone'
import { kycMixin } from 'src/plugins/mixins'
import _ from 'lodash'

export default {
  name: 'audio-recorder',

  mixins: [ kycMixin ],

  props: {
    uploadUrl: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      isRecording: false,
      isUploading: false,
      stream: null,
      mic: null,
      recordedAudio: null,
      audioBlob: null,
      timeInterval: null,
      minutes: '00',
      seconds: '00',
      hours: '00',
      sizePerSecond: 56,
      isSecureOrigin: false
    }
  },

  methods: {
    startRecording () {
      this.isRecording = true
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.stream = stream
        this.recordedAudio = null
        this.audioBlob = null
        this.mic = new Microphone(stream)
        this.mic.start()
        this.startRecordingTime()
      }).catch(err => {
        this.isRecording = false
        console.log(err)
        this.$generalNotification('Microphone is blocked by the user.', 'warning')
      })
    },

    stopRecording () {
      this.clearRecorder()
      this.captureRecording()
    },

    clearRecorder () {
      this.isRecording = false
      if (this.mic !== null && this.stream !== null && this.stream.active) {
        this.mic.stop()
      }
      if (this.stream !== null) {
        this.stream.getTracks().forEach(track => track.stop())
      }
      if (this.timeInterval !== null) {
        clearInterval(this.timeInterval)
      }
    },

    startRecordingTime () {
      this.resetRecordingTime()
      const timeData = {
        timeStarted: new Date().getTime(),
        currentTime: null,
        timeElapsed: null,
        estimatedFileSize: 0
      }
      this.timeInterval = setInterval(() => {
        timeData.currentTime = new Date().getTime()
        timeData.timeElapsed = new Date(timeData.currentTime - timeData.timeStarted)
        this.hours = _.padStart(timeData.timeElapsed.getUTCHours(), 2, '0')
        this.minutes = _.padStart(timeData.timeElapsed.getUTCMinutes(), 2, '0')
        this.seconds = _.padStart(timeData.timeElapsed.getUTCSeconds(), 2, '0')

        // per_second_size is in kilobytes
        timeData.estimatedFileSize += this.sizePerSecond
        // once the 8MB limit is reached, stop the recording.
        if ((timeData.estimatedFileSize + this.sizePerSecond) >= 8000) {
          this.$generalNotification('The audio recording has reached the limit of 8MB. Recording is automatically stopped.', 'error')
          this.stopRecording()
        }
      }, 1000)
    },

    resetRecordingTime () {
      this.hours = '00'
      this.minutes = '00'
      this.seconds = '00'
    },

    captureRecording () {
      this.audioBlob = this.mic.export()
      const reader = new FileReader()
      reader.onload = () => {
        this.recordedAudio = new Audio(reader.result)
      }

      reader.readAsDataURL(this.audioBlob)
    },

    removeRecordedAudio () {
      this.audioBlob = null
      this.recordedAudio = null
    },

    playRecordedAudio () {
      document.getElementById('recorded').play()
    },

    uploadRecordedAudio () {
      this.isUploading = true
      const audioFileName = new Date().getTime() + '_recording_upload.wav'
      const data = new FormData()

      data.append('file', this.audioBlob, audioFileName)

      return window.axios.post(this.uploadUrl, data).then(response => {
        this.$emit('recordedAudioUploaded', {
          file_name: response.data.file_name,
          uid: response.data.file_name,
          id: response.data.file_name
        })
        this.recordedAudio = null
        this.isUploading = false
      }).catch(err => {
        console.log(err)
        this.isUploading = false
        this.$generalNotification(err.response, 'error')
      })
    }
  },

  created () {
    if (typeof navigator.mediaDevices !== 'undefined') {
      this.isSecureOrigin = true
    }
  },

  beforeDestroy () {
    clearInterval(this.timeInterval)
  }
}
</script>
