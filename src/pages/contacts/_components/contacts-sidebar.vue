<template>
  <card class="h-100 max-h-100">
    <contacts-pinned></contacts-pinned>
    <contacts-folders></contacts-folders>
  </card>
</template>

<script>
import Card from 'components/card/card.vue'
import ContactsPinned from './contacts-pinned.vue'
import ContactsFolders from './contacts-folders.vue'
export default {
  components: {
    Card,
    ContactsPinned,
    ContactsFolders
  }
}
</script>
