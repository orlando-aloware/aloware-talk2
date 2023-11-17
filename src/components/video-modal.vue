<template>
  <div class="video-modal-section d-flex align-items-center">
    <q-btn class="activator-outline__button height-35 mr-2"
           color="primary"
           outline
           no-caps
           @click="openModal"
           v-if="shouldShowDefaultActivator">
      Open Tutorial Video 🤩
    </q-btn>
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
import { mapActions } from 'vuex'

export default {
  name: 'video-modal',

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
    },

    shouldShowInFirstVisit: {
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

    if (!this.$cookies.get(this.cookieName) && this.shouldShowInFirstVisit) {
      this.showModal = true
      return this.setIsIntroVideoVisible(true)
    }

    return this.setIsIntroVideoVisible(null)
  },

  methods: {
    ...mapActions(['setIsIntroVideoVisible']),

    closeModal () {
      this.showModal = false
      this.$cookies.set(this.cookieName, 'viewed') // Set cookie to expire in 1 day
      this.setIsIntroVideoVisible(null)
    },

    openModal () {
      this.showModal = true
    }
  }
}
</script>
