<template>
  <div class="full-height">
    <template v-if="!isLoading">
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
  name: 'HubSpotInboxConnect',
  mixins: [aclMixin],

  data () {
    return {
      isLoading: false
    }
  },

  computed: {
    ...mapState('auth', ['authenticated'])
  },

  methods: {
    ...mapActions('auth', ['check']),

    async handleAuthRedirect () {
      if (this.authenticated) {
        return
      }

      this.isLoading = true

      try {
        await this.check()
      } catch (error) {
        this.$router.push({
          name: 'Login',
          query: {
            redirect: this.$route.fullPath
          }
        })
      } finally {
        this.isLoading = false
      }
    },

    async getSmsCampaigns () {

    }
  },

  async created () {
    await this.handleAuthRedirect()
  }
}
</script>
