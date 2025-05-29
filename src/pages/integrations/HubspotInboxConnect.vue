<template>
  <div class="full-height">
    <template v-if="!loading">
      <h1>HubSpot Inbox</h1>
    </template>
    <div v-else class="flex flex-center full-height">
      <q-spinner-bars color="primary" size="40px" />
    </div>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'HubSpot Inbox',
  mixins: [aclMixin],

  data () {
    return {
      loading: true
    }
  },

  computed: {
    ...mapState('auth', ['authenticated'])
  },

  methods: {
    ...mapActions('auth', ['check']),

    async handleAuthRedirect () {
      if (this.authenticated) {
        this.loading = false
        return
      }

      try {
        await this.check()
        this.loading = false
      } catch (error) {
        this.$router.push({
          name: 'Login',
          query: {
            redirect: this.$route.fullPath
          }
        })
      }
    }
  },

  async created () {
    await this.handleAuthRedirect()
  }
}
</script>
