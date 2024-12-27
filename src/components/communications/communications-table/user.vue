<template>
  <div data-testid="user-row">
    <span v-if="isAgent && value">
      {{ getUserName(getUser(value)) }}
    </span>
    <a target='_blank'
       :href="getUserURL(value)"
       v-else-if="value">
      {{ getUserName(getUser(value)) }}
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { userMixin, aclMixin, classicMixin } from 'src/plugins/mixins'

export default {
  name: 'User',

  mixins: [
    userMixin,
    aclMixin,
    classicMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    }
  }
}
</script>
