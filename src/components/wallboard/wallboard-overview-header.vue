<template>
  <div class="overview__header">
    <b-dropdown text="..."
                no-caret
                right
                variant="light"
                class="m-2 b-compact-dropdown-button dropdown-white">
      <b-dropdown-item @click="setOverviewDetailed(!isOverviewDetailed)">
        View {{ isOverviewDetailed ? 'Less' : 'More' }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'wallboard-overview-header',

  computed: {
    ...mapState('wallboard', [
      'isOverviewDetailed'
    ])
  },

  methods: {
    ...mapMutations('wallboard', {
      setOverviewDetailed: 'SET_OVERVIEW_DETAILED'
    })
  }
}
</script>
