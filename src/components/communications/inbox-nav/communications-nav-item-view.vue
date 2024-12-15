<template>
  <div>
    <h4>Navigation Item</h4>
    <div class="mb-3">
      <div class="text-muted mb-1">Inactive</div>
      <nav-item label="Tasks" value="tasks" icon="task" />
    </div>
    <div class="mb-3">
      <div class="text-muted mb-1">Active</div>
      <nav-item label="Tasks" value="tasks" icon="task" :isActive="true" />
    </div>

    <div class="mb-3">
      <div class="text-muted mb-1">Badge Default</div>
      <nav-item
        label="Tasks"
        value="tasks"
        icon="task"
        :isActive="true"
        :badge="true"
        badgeColor="default"
        badgeValue="10"
      />
    </div>

    <div class="mb-3">
      <div class="text-muted mb-1">Badge Danger</div>
      <nav-item
        label="Tasks"
        value="tasks"
        icon="task"
        :isActive="true"
        :badge="true"
        badgeColor="danger"
        badgeValue="10"
      />
    </div>

    <div class="mb-3">
      <div class="text-muted mb-1">Compressed</div>
      <div class="compressed">
        <nav-item
          label="Tasks"
          value="tasks"
          icon="task"
          :isActive="true"
          :badge="true"
          :closed="true"
          badgeColor="danger"
          badgeValue="10"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NavItem from './communications-nav-item.vue'
export default {
  components: {
    NavItem
  }
}
</script>
