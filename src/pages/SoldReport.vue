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
import { mapActions, mapState } from 'vuex'
import { htmlMixin } from 'src/plugins/mixins'

export default {
  data () {
    return {
      source: ''
    }
  },

  mixins: [htmlMixin],

  computed: {
    ...mapState(['statics'])
  },

  mounted () {
    this.$axios.get('/integrations/simpsocial/sold-report-source').then(res => {
      this.source = res.data.source
    }).catch(err => {
      console.log(err)
    })
  },

  created () {
    this.setPageInfo()
  },

  methods: {
    ...mapActions('auth', ['check']),

    setPageInfo () {
      this.setPageTitle('Sold Report - ' + this.statics.name)
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
