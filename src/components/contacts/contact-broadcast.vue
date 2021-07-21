<template>
  <b-card class="border-0">
    <h6>Broadcast</h6>
    <div>
      <b-badge v-for="broadcast in contact.broadcasts"
               variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-b-tooltip="broadcast.name"
               :key="broadcast.id">
        {{ broadcast.name }}
      </b-badge>
      <p v-if="!contact.broadcasts"
         class="status-notice text-muted">
        No broadcast data available.
      </p>
    </div>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-broadcast',
  computed: {
    ...mapGetters('contacts', ['contact'])
  }
}
</script>

<style lang="scss" scoped>
.status-notice {
  font-size: 12px;
}
</style>
