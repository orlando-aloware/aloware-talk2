<template>
  <div>
    <h4>Navigation Item</h4>
    <div class="mb-2">
      <div class="text-muted mb-1">Inactive</div>
      <inbox-nav-item label="Tasks" value="tasks" icon="task" />
    </div>
    <div class="mb-2">
      <div class="text-muted mb-1">Active</div>
      <inbox-nav-item label="Tasks" value="tasks" icon="task" :isActive="true" />
    </div>
    <div class="mb-2">
      <div class="text-muted mb-1">with badge default</div>
      <inbox-nav-item
        label="Tasks"
        value="tasks"
        icon="task"
        :isActive="true"
        :badge="true"
        badgeColor="default"
        badgeValue="10"
      />
    </div>

    <div class="mb-2">
      <div class="text-muted mb-1">with badge danger</div>
      <inbox-nav-item
        label="Tasks"
        value="tasks"
        icon="task"
        :isActive="true"
        :badge="true"
        badgeColor="danger"
        badgeValue="10"
      />
    </div>
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
