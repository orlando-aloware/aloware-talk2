<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Broadcast</h6>
    <div>
      <b-badge v-for="broadcast in contact.broadcasts"
               variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-b-tooltip="broadcast.name"
               :key="broadcast.id">
        {{ broadcast.name }}
      </b-badge>
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

</style>
