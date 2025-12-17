<template>
  <div></div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'auth.sample.vue',
  methods: {
    /**
     * Map actions to component method
     * this.login
     * this.logout
     * this.check
     */
    ...mapActions('auth', ['login', 'logout', 'check'])
  },
  computed: {
    /**
     * Map state to computed values
     * this.profile
     * this.authenticated
     */
    ...mapState('auth', ['profile', 'authenticated']), // check auth.store.js
    /**
     * Map getters to computed values
     * user object is derived from profile and authenticated state
     * const {profile, authenticated} = this.user
     */
    ...mapGetters('auth', ['user']) // check auth.getters.js
  }
}
</script>
