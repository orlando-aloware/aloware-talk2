<template>
  <div>
    <div class="text-muted">Inactive</div>
    <inbox-nav-item label="Tasks" value="tasks" />
  </div>
</template>

<script>
import InboxNavItem from './inbox-nav-item.vue'
export default {
  components: {
    InboxNavItem
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
</style>
