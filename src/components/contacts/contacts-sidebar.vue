<template>
  <card class="h-100 border-0 no-border-radius">
    <contacts-pinned></contacts-pinned>
    <contacts-shared></contacts-shared>
    <contacts-folders></contacts-folders>
  </card>
</template>

<script>
import Card from 'components/card.vue'
import ContactsPinned from './contacts-pinned.vue'
import ContactsFolders from './contacts-folders.vue'
import ContactsShared from './contacts-shared'
export default {
  components: {
    ContactsShared,
    Card,
    ContactsPinned,
    ContactsFolders
  }
}
</script>
