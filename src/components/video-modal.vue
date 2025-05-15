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
          <h3 v-if="title">{{ title }}</h3>
          <button
            class="close-button"
            @click="closeModal"
          >✖
          </button>
        </div>
        <div class="modal-body">
          <iframe
            :src="videoUrl"
            allowfullscreen
            frameborder="0"
          />
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
      showModal: false
    }
  },

  computed: {
    ...mapState('auth', ['profile']),

    parsedCookieName () {
      return `${this.cookieName}-${this.profile?.id}`
    }
  },

  created () {
    this.$cookies = VueCookies

    if (!this.$cookies.get(this.parsedCookieName) && this.shouldShowInFirstVisit) {
      this.showModal = true
      return this.setIsIntroVideoVisible(true)
    }
  },

  methods: {
    ...mapActions(['setIsIntroVideoVisible']),

    closeModal () {
      this.showModal = false
      this.$cookies.set(this.parsedCookieName, 'viewed', 3650) // Set cookie to expire in 10 years
      this.setIsIntroVideoVisible(null)
    },

    openModal () {
      this.showModal = true
    }
  }
}
</script>
