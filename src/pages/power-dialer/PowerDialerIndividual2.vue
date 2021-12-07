<template>
  <div
    v-if="authenticated"
    class="row mx-0 content-row d-flex overflow-hidden h-100">
    <div class="col-2 pt-0 pl-0 pr-0 mb-0 h-100 bordered-right">
      Here is the individual contact page...
    </div>
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
