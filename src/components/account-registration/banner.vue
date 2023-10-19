<template>
  <div class="banner col-xl-4 q-xl-show q-md-hide q-sm-hide">
    <div class="text-center items-center align-center">
      <img
        :src="getBannerImageSrc()"
        alt="phone" />
      <div class="card text-center">
        <h3 class="mb-4 mt-4">{{ getBannerTitle() }}</h3>
        <p v-html="getBannerDescription()" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Banner',
  props: {
    currentStep: {
      type: Number,
      default: 1
    }
  },
  methods: {
    getBannerImageSrc () {
      switch (this.step) {
        case 1:
          return '/images/woman-agent.png'
        case 2:
          return '/images/man-agent.png'
        case 3:
          return '/images/woman-agent-in-call.png'
        default:
          return '/images/woman-agent.png'
      }
    },

    getBannerTitle () {
      switch (this.step) {
        case 1:
          return 'Your customers prefer text'
        case 2:
          return 'Supercharge your sales team'
        case 3:
          return 'Measure the metrics that matter'
        default:
          return 'Your customers prefer text'
      }
    },

    getBannerDescription () {
      switch (this.step) {
        case 1:
          return 'Research (and common sense!) shows that people look at their texts within 3 minutes, and open <span class="text-weight-bold">97% of messages</span> they receive.<br>Be where it matters most: their inbox. 📥'
        case 2:
          return 'Make <span class="text-weight-bold">300+ calls daily</span> with our AI-driven power dialer. Scale up text campaigns with smart sequence builder.<br>Your CRM has the fuel, Aloware brings the fire. 🚀'
        case 3:
          return 'Gain visibility into the metrics that matter to your business with advanced <span class="text-weight-bold">reporting, pre-built</span>, and <span class="text-weight-bold">customizable dashboards</span>. 📊'
        default:
          return 'Texting is the most preferred communication channel for customers. With Aloware, you can text your customers from your business phone number.'
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
