<template>
  <div class="video-modal-section d-flex align-items-center">
    <button class="activator-button"
            type="icon"
            plain
            v-if="shouldShowDefaultActivator"
            @click="openModal">
      <div class="activator-icon">
        <video-camera-icon />
      </div>
    </button>

    <slot name="activator"
          v-else
          @click="openModal" />
    <div class="video-modal"
         v-if="showModal">
      <div class="overlay"
           @click="closeModal"/>
      <div class="modal-content">
        <div class="modal-header">
          <h3 v-if="title">{{ title }}</h3>
          <button class="close-button"
                  @click="closeModal">✖</button>
        </div>
        <div class="modal-body">
          <iframe frameborder="0"
                  allowfullscreen
                  :src="videoUrl"/>
        </div>
        <div class="modal-notes"
              v-if="notes">
          <p v-html="notes" />
          <div class="modal-link"
               v-if="learnMoreLink">
            <a target="_blank"
               rel="noopener noreferrer"
               :href="learnMoreLink">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueCookies from 'vue-cookies'
import VideoCameraIcon from './icons/video-camera-icon.vue'

export default {
  name: 'video-modal',

  components: {
    VideoCameraIcon
  },

  props: {
    title: {
      type: String,
      default: null
    },

    notes: {
      type: String,
      default: null
    },

    cookieName: {
      type: String,
      required: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    learnMoreLink: {
      type: String,
      default: null
    },

    shouldShowDefaultActivator: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      showModal: false
    }
  },

  created () {
    this.$cookies = VueCookies

    if (!this.$cookies.get(this.cookieName)) {
      this.showModal = true
    }
  },

  methods: {
    closeModal () {
      this.showModal = false
      this.$cookies.set(this.cookieName, 'viewed') // Set cookie to expire in 1 day
    },

    openModal () {
      this.showModal = true
    }
  }
}
</script>
