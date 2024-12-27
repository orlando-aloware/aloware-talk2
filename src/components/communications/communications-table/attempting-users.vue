<template>
  <div data-testid="attempting-users-row">
    <target-users-tree :communication="row"
                       :show-label="false"/>
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
    }
  }
}
</script>
