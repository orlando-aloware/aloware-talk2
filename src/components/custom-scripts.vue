<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'custom-scripts',

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  mounted () {
    this.setup()
  },

  methods: {
    setup () {
      // Moderate Genius
      // if (this.currentCompany && this.currentCompany.reseller_id === 2132) {
      const moderateGeniusScript = document.createElement('script')
      moderateGeniusScript.setAttribute(
        'src',
        'https://js-na1.hs-scripts.com/20073549.js'
      )
      moderateGeniusScript.setAttribute(
        'id',
        'hs-script-loader'
      )

      moderateGeniusScript.async = true
      moderateGeniusScript.defer = true

      document.body.appendChild(moderateGeniusScript)
      // }
    }
  }
}
</script>
