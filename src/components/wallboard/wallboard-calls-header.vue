<template>
  <div class="calls__header">
    <search placeholder="Search Agent"
            @search="onSearch"/>
    <div class="flex-grow-1 text-right">
      <wallboard-calls-columns-dropdown />
    </div>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
import WallboardCallsColumnsDropdown from 'src/components/wallboard/wallboard-calls-columns-dropdown.vue'

export default {
  name: 'wallboard-calls-header',

  components: {
    Search,
    WallboardCallsColumnsDropdown
  },

  methods: {
    onSearch (data) {
      this.$emit('agent', data)
    }
  }
}
</script>
