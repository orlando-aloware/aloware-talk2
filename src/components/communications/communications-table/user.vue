<template>
  <div class="ellipse"
       data-testid="user-row">
    <a href="#"
       v-if="value"
       @click.prevent="filter">
      {{ getUserName(getUser(value)) }}

      <q-tooltip>
        Click to filter by this user
      </q-tooltip>
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
    },

    row: {
      type: Object,
      required: true
    }
  },

  methods: {
    filter () {
      this.$emit('on-filter', {
        type: 'user',
        value: this.value
      })
    }
  }
}
</script>
