<template>
  <q-card
    :disabled="sessionLoader"
    flat
    class="p-0">
    <q-card-section class="px-0" style="overflow:auto;">

      <ScriptSelector
        :communication="contact"
        v-model="scriptId"
        class="px-3 w-100"
        @change="changeScript" />

      <div
        v-html="resources.message"
        class="t-scroll-y2 py-3 px-3"
        style="overflow:auto;">
      </div>

    </q-card-section>
  </q-card>
</template>

<script>

import { mapGetters } from 'vuex'
import ScriptSelector from 'components/generic-selectors/script-selector'

export default {
  name: 'DetailsScripts',
  components: {
    ScriptSelector
  },
  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters('contacts', [
      'contact'
    ]),
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ])
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
