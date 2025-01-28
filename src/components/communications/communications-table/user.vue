<template>
  <div class="ellipse"
       data-testid="user-row">
    <a href="#"
       :id="`comm-user-${_uid}`"
       v-if="value"
       @click.prevent="filter">
      {{ getUserName(getUser(value)) }}

      <b-tooltip custom-class="communication-logs-table__tooltip"
                 :target="`comm-user-${_uid}`">
        Click to filter by this user
      </b-tooltip>
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { userMixin } from 'src/plugins/mixins'

export default {
  name: 'User',

  mixins: [
    userMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    }
  },

  methods: {
    filter () {
      this.$emit('on-filter', {
        type: 'users',
        value: [this.value]
      })
    }
  }
}
</script>
