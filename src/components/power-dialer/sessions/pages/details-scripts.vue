<template>
  <q-card flat class="p-0">
    <q-card-section class="px-0" style="overflow:auto;">

      <ScriptSelector
        :communication="communication"
        v-model="scriptId"
        class="px-3 w-100"
        @change="changeScript" />

      <!-- <q-select
        v-model="resources.leads"
        :options="resources.options"
        outlined
        class="px-3" /> -->
      <div
        v-html="resources.message"
        class="t-scroll-y2 py-3 px-3"
        style="overflow:auto;"></div>

    </q-card-section>
  </q-card>
</template>

<script>

import ScriptSelector from 'components/generic-selectors/script-selector'

export default {
  name: 'DetailsLeads',
  components: {
    ScriptSelector
  },
  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      scriptId: null,
      communication: {}
    }
  },
  methods: {
    changeScript () {
      console.log('Calling scripts...')
    }
  }
}
</script>
