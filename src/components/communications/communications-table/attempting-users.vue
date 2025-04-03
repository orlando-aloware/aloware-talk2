<template>
  <div data-testid="attempting-users-row"
       class="ellipse attempting-users-container"
       v-if="row.attempting_users?.length > 0">
    <target-users-tree :class="{ 'expand-on-hover': shouldExpandOnHover }"
                       :communication="row"
                       :show-label="false"/>
    <i class="fa fa-chevron-down show-more-icon"
       v-if="shouldExpandOnHover"/>
  </div>
</template>

<script>
import TargetUsersTree from 'components/target-users-tree.vue'

export default {
  name: 'AttemptingUsers',

  components: {
    TargetUsersTree
  },

  props: {
    row: {
      type: Object,
      required: true
    },

    expandOnHover: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    shouldExpandOnHover () {
      return this.expandOnHover && (this.row.attempting_users?.length > 1 || this.row.target_users?.length > 1)
    }
  }
}
</script>
