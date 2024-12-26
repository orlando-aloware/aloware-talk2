<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <span v-if="isAgent">
      {{ getUserName(getUser(value)) }}
    </span>
    <a target='_blank'
       :href="getUserURL(value)"
       v-else>
      {{ getUserName(getUser(value)) }}
    </a>
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
      required: true
    }
  }
}
</script>
