<template>
  <div class="row w-100">
    <div class="sold-report-container w-100 vh-100">
        <iframe frameborder="0"
                class="w-100 h-100"
                :src="source">
        </iframe>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      source: ''
    }
  },

  mounted () {
    this.$axios.get('/integrations/simpsocial/sold-report-source').then(res => {
      this.source = res.data.source
    }).catch(err => {
      console.log(err)
    })
  },

  created () {
    this.getStatics()
  },

  methods: {
    ...mapActions('auth', ['check']),

    getStatics () {
      talk2Api.V1.statics.get(this.currentCompany?.id)
        .then(res => {
          this.statics = res.data
          this.setPageTitle('Sold Report - ' + this.statics.name)
        })
        .catch(err => {
          this.setPageTitle('Sold Report - Aloware')
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    }
  },

  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.check()
        .then((res) => {
          if (res.data.user) {
            next()
          }
        })
        .catch((err) => {
          console.error(err)
          next({ name: 'Login', query: { redirect: to.fullPath } })
        })
    })
  }
}
</script>
