<template>
  <q-item-label class="pl-3 pr-3">
    <template v-for="item in skeletons">
      <q-skeleton type="text"
                  data-testid="contacts-sidebar-loader-skeleton"
                  animation="fade"
                  height="20px"
                  :key="`${item}-skeleton`" />
    </template>
  </q-item-label>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'contacts-sidebar-loader',
  props: {
    items: {
      type: Number,
      default: 3
    }
  },
  computed: {
    skeletons () {
      return _.range(this.items)
    }
  }
}
</script>
