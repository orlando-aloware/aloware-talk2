<template>
  <div class="users__table__agent-ring-groups">
    <div v-if="ringGroups.length > 0">
      <div class="users__table__agent-ring-groups__ring-group-name">
        {{ firstRingGroup.name }}
      </div>
      <span class="text-primary ml-1"
            v-if="ringGroups.length > 1">
        + {{ ringGroups.length - 1 }} more
      </span>
      <b-popover>
      </b-popover>
    </div>
    <div v-else>
      --
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    ringGroups: {
      type: Array,
      required: false,
      default: () => ([])
    }
  },

  computed: {
    ...mapState({
      allRingGroups: 'ringGroups'
    }),

    firstRingGroup () {
      return this.allRingGroups.find(rg => rg.id === this.ringGroups[0])
    }
  }
}
</script>
