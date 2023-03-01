<template>
  <div class="row w-100">
    <div class="messenger-container w-100"
         :style="{height: '100vh'}">
      <iframe frameborder="0"
              class="w-100 h-100"
              :src="source">
      </iframe>
    </div>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { resellerMixin } from 'src/plugins/mixins'

export default {
  name: 'DMSEquity',

  mixins: [ resellerMixin ],

  data () {
    return {
      source: ''
    }
  },

  mounted () {
    this.getIntegration()
  },

  methods: {
    getIntegration () {
      talk2Api.V1.integrations.simpsocial.dmsEquity.get()
        .then(res => {
          this.source = res.data.source
        })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
    }
  }
}
</script>
