<template>
  <b-toast
    :id="toastId"
    v-model="showToast"
    solid
    no-auto-hide
    toaster="b-toaster-bottom-right"
    toast-class="action-notification extended-width notification-border-round bg-blue-60-opaque position-relative background-blur"
    header-class="border-0 p-0 bg-blue-60-opaque"
    @hidden="onHidden"
    @shown="onShown"
  >
    <div class="notification-body-wrapper">
      <div class="d-flex flex-row align-items-center">
        <div class="mr-2 notification-icon">
          <call-incoming-icon />
        </div>
        <div class="notification-details">
          <div class="d-flex flex-grow-1 align-items-baseline w-100">
            <strong class="mr-auto text-white title pr-1">
              Allow Ringing Sound
            </strong>
          </div>
          <div class="text-grey-81 message-body text-break d-flex w-100">
            <div class="flex-grow-1 d-flex align-items-center w-100">
              <span class="message-text">
                The ringing sound will only play after you interact with the page, due to browser audio restrictions.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-toast>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'NotificationSoundUserActionToast',

  data () {
    return {
      showToast: false,
      toastId: 'notification-sound-user-action-toast'
    }
  },

  methods: {
    ...mapActions(['setEnableAudio']),

    onShown () {
      this.setNoSoundFavicon()
      document.addEventListener('click', this.resetFavicon)
    },

    onHidden () {
      // Enable the audio after the user interacts with the page
      this.resetFavicon()
      this.setEnableAudio(true)
      this.$bvToast.hide(this.toastId)
    },

    updateFaviconElement (element, filename) {
      document.getElementById(element).href = filename
    },

    getEnvIconSettings () {
      const env = process.env.APP_ENV
      const iconPrefix = env !== 'production' ? 'favicon-dev' : 'favicon'
      const faviconElements = ['favicon128', 'favicon96', 'favicon32', 'favicon16', 'faviconIco']

      return {
        iconPrefix,
        faviconElements
      }
    },

    updateFaviconWithPrefix (prefix) {
      const { iconPrefix, faviconElements } = this.getEnvIconSettings()
      const iconPrefixToUse = prefix ? `${iconPrefix}-${prefix}` : iconPrefix

      faviconElements.forEach(element => {
        const size = element.replace('favicon', '')
        const isIco = size === 'Ico'
        const suffix = isIco ? '.ico' : `-${size}x${size}.png`
        const filename = `${iconPrefixToUse}${suffix}`
        this.updateFaviconElement(element, filename)
      })
    },

    setNoSoundFavicon () {
      this.updateFaviconWithPrefix('no-sound')
    },

    resetFavicon () {
      // Reset the favicon to the original state after the user interacts with the page
      this.updateFaviconWithPrefix()
      document.removeEventListener('click', this.resetFavicon)

      setTimeout(() => {
        // Hide the toast after 5 seconds if the resetFavicon was triggered by the event listener
        this.showToast = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
.message-text {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
