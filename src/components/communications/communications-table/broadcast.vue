<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <router-link target='_blank'
                 :to="{ path: `/broadcasts/${value}` }"
                 v-if="broadcast.id">
      {{ broadcast.name || '-' }}
    </router-link>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Broadcast',

  props: {
    value: {
      type: Number,
      required: false
    }
  },

  computed: {
    ...mapState(['broadcasts']),

    broadcast () {
      return this.broadcasts.find(broadcast => broadcast.id === this.value) || {}
    }
  }
}
</script>
