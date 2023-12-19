<template>
  <div class="d-none d-lg-block">
    <div class="h-100 d-flex justify-content-center align-items-center text-center"
         :class="loginClass">
      <div>
        <div class="row"
             style="max-width:550px">
          <div class="col-12"
               v-if="xmasEnabled">
            <div>
              <img src="images/xmas-merry.png"
                     style="max-width: 550px;" />
              <q-btn
                label="Read our reviews!"
                class="button px-2 fs-24 text-decoration-none font-weight-normal w-100"
                color="positive"
                type="submit"
                :href="getUrlReviews"
                target="_blank"
                style="max-width: 292px;"
                no-caps
                />
            </div>
          </div>
          <div class="col-12"
               v-else>
            <h1 class="mb-4 text-white text-h4 text-weight-bold banner-font text-banner-title">
              Our AI-powered <br> call transcription feature <br> is now available
            </h1>
            <p class="mb-4 text-white banner-font text-banner-subtitle">
              <br>
              Get up to 5000 minutes for free
            </p>
            <div>
              <a class="btn btn-primary btn-xl px-5"
                 target="_blank"
                 href="mailto:support@aloware.com?subject=Enable transcription for free">
                Request access
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login-large-screens-info',

  props: {
    xmasEnabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    loginClass () {
      return [
        this.xmasEnabled ? 'xmas-bg' : 'ai-bg'
      ]
    },

    getUrlReviews () {
      return process.env.URL_READ_REVIEWS || 'https://www.g2.com/products/aloware/references/the-premier-cloud-contact-center-software-for-small-and-mid-sized-businesses'
    }
  },

  data () {
    return {
      slide: '1'
    }
  }
}
</script>
