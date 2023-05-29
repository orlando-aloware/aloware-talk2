<template>
  <div class="users__table__agent-ring-groups"
       :id="`rg-container-${_uid}`">
    <div v-if="hasRingGroups">
      <div class="users__table__agent-ring-groups__ring-group-name">
        {{ firstRingGroup.name }}
      </div>
      <span class="text-primary ml-1 cursor-pointer"
            :id="`rg-more-${_uid}`"
            v-if="ringGroups.length > 1">
        + {{ ringGroups.length - 1 }} more
      </span>
      <b-popover triggers="hover"
                 :container="`rg-container-${_uid}`"
                 :target="`rg-more-${_uid}`"
                 v-if="ringGroups.length > 1">
        <span class="d-block mb-1"
              :key="ringGroup.id"
              v-for="ringGroup in userRingGroups">
          {{ ringGroup.name }}
        </span>
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
  name: 'wallboard-agent-ring-groups',

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
      return this.allRingGroups.find(rg => rg.id === this.ringGroups[0]) || {}
    },

    userRingGroups () {
      // using map + find to keep the order of user's ring groups
      return this.ringGroups.map(id => this.allRingGroups.find(rg => rg.id === id))
    },

    hasRingGroups () {
      return this.ringGroups.length > 0 && this.allRingGroups.length > 0
    }
  }
}
</script>
