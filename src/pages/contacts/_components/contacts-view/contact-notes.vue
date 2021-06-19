<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Notes</h6>
    <div class="notes">
      {{ contact.notes }}
    </div>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-notes',
  computed: {
    ...mapGetters('contacts', ['contact'])
  }
}
</script>

<style lang="scss" scoped>
  .notes{
    font-size: 80%;
  }
</style>
