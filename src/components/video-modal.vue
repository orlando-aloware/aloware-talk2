<template>
  <div class="video-modal-section d-flex align-items-center">
    <q-btn
      v-if="shouldShowDefaultActivator"
      class="activator-outline__button height-35 mr-2"
      color="primary"
      no-caps
      outline
      @click="openModal"
    >
      Open Tutorial Video 🤩
    </q-btn>
    <slot
      v-else
      name="activator"
      @click="openModal"
    />
    <div
      v-if="showModal"
      class="video-modal"
    >
      <div
        class="overlay"
        @click="closeModal"
      />
      <div class="modal-content">
        <div class="modal-header">
          <h3 v-if="title" class="d-none d-md-flex">{{ title }}</h3>
          <button
            class="close-button ml-auto"
            @click="closeModal"
          >✖
          </button>
        </div>
        <div class="modal-body animated position-relative">
          <div
            v-if="isLoading"
            class="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
          >
            <i class="fa fa-spinner fa-spin fa-3x"></i>
          </div>
          <iframe
            :class="{ show: !isLoading}"
            :src="videoUrl"
            allowfullscreen
            class="fade animated"
            frameborder="0"
            @load="onIframeLoad"
          ></iframe>
        </div>
        <div
          v-if="notes"
          class="modal-notes"
        >
          <p v-html="notes" />
          <div
            v-if="learnMoreLink"
            class="modal-link"
          >
            <a
              :href="learnMoreLink"
              rel="noopener noreferrer"
              target="_blank"
            >
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
import { mapActions, mapState } from 'vuex'

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
      showModal: false,
      isLoading: false
    }
  },

  computed: {
    ...mapState('auth', ['profile']),

    parsedCookieName () {
      return `${this.cookieName}-${this.profile?.id}`
    }
  },

  methods: {
    ...mapActions(['setIsIntroVideoVisible']),

    closeModal () {
      this.showModal = false
      this.$cookies.set(this.parsedCookieName, 'viewed', '3650d') // Set cookie to expire in 10 years
      this.setIsIntroVideoVisible(null)
    },

    openModal () {
      this.isLoading = true
      this.showModal = true
    },

    onIframeLoad () {
      this.isLoading = false
    }
  },
  mounted () {
    this.isLoading = true

    this.$cookies = VueCookies

    if (!this.$cookies.get(this.parsedCookieName) && this.shouldShowInFirstVisit) {
      this.showModal = true
      return this.setIsIntroVideoVisible(true)
    }
  }
}
</script>
