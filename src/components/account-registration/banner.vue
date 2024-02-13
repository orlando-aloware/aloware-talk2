<template>
  <div class="banner col-xl-4 q-xl-show q-md-hide q-sm-hide">
    <div class="text-center items-center align-center">
      <img :alt="getBannerTitle()"
           :src="getBannerImageSrc()" />
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
      switch (this.currentStep) {
        case 0:
          return '/images/ssu-start.png'
        case 1:
          return '/images/ssu-account-creation.png'
      }
    },

    getBannerTitle () {
      switch (this.currentStep) {
        case 0:
          return 'Revolutionize the way you communicate!'
        case 1:
          return 'Let\'s set you up for success'
      }
    },

    getBannerDescription () {
      switch (this.currentStep) {
        case 0:
          return 'Aloware is the premier cloud contact center solution offering a robust suite of calling, texting, and automation tools to effortlessly fuel growth and deliver exceptional customer experiences at scale. Get ready to take your business to the next level!'
        case 1:
          return 'Telecommunications regulatory authorities need certain information to make sure that calls and texts are from a real business. Please take a moment to provide this info so we can verify your business & unlock outgoing calls during your trial.'
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
