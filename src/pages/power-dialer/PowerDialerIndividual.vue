<template>
  <div
    v-if="authenticated"
    class="row mx-0 content-row d-flex overflow-hidden h-100">
    This should display individual details of the selected item in the list
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'PowerDialerIndividual',
  computed: {
    ...mapGetters('auth', ['authenticated'])
  }
}
</script>
