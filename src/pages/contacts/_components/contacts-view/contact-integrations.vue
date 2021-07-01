<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Integrations</h6>

  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-integrations',
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  methods: {
    getIntegrationData () {

    }
  }
}
</script>

<style scoped>

</style>
