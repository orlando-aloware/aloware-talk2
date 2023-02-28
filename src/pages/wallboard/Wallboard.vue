<template>
  <div class="wallboard mx-0 d-flex overflow-hidden h-100"
       v-if="authenticated">
    <wallboard-sidebar/>
    <!-- header -->
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WallboardSidebar from 'src/components/wallboard/wallboard-sidebar.vue'

export default {
  name: 'Wallboard',

  components: {
    WallboardSidebar
  },

  computed: {
    ...mapGetters('auth', ['authenticated'])
  }
}
</script>
