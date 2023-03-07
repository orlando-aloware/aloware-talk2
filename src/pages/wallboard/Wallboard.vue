<template>
  <div class="wallboard"
       v-if="authenticated">
    <wallboard-sidebar/>
    <wallboard-header/>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WallboardHeader from 'src/components/wallboard/wallboard-header.vue'
import WallboardSidebar from 'src/components/wallboard/wallboard-sidebar.vue'

export default {
  name: 'Wallboard',

  components: {
    WallboardHeader,
    WallboardSidebar
  },

  computed: {
    ...mapGetters('auth', ['authenticated'])
  }
}
</script>
