<template>
  <div class="wallboard"
       v-if="authenticated">
    <wallboard-sidebar/>
    <wallboard-header/>
    <router-view></router-view>
  </div>
</template>

<script>
import WallboardHeader from 'src/components/wallboard/wallboard-header.vue'
import WallboardSidebar from 'src/components/wallboard/wallboard-sidebar.vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'Wallboard',

  components: {
    WallboardHeader,
    WallboardSidebar
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ])
  },

  created () {
    // FIXME: fetch all things here
    this.fetchUsers()
  },

  mounted () {
    // user updated event
    this.$VueEvent.listen('user_updated', (user) => {
      this.SET_USER(user)
    })

    // agent status updated event
    this.$VueEvent.listen('agent_status_updated', (event) => {
      this.SET_AGENT_STATUS(event)
    })
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchUsers'
    ]),

    ...mapMutations('wallboard', [
      'SET_AGENT_STATUS',
      'SET_USER'
    ])
  }
}
</script>
