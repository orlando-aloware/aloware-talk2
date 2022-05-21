<template>
  <b-card class="border-0">
    <h4>Broadcast</h4>
    <div class="mt-1">
      <b-badge v-for="broadcast in contact.broadcasts"
               variant="primary"
               class="badge-tag badge-tag-primary ellipsis bg-transparent"
               :key="broadcast.id">
        <q-tooltip anchor="top middle"
                   self="center middle"
                   :offset="[20, 20]">
          {{ broadcast.name }}
        </q-tooltip>
        {{ broadcast.name }}
      </b-badge>
      <p v-if="!contact.broadcasts || contact.broadcasts.length < 1"
         class="status-notice text-muted mb-0 fs-12">
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
