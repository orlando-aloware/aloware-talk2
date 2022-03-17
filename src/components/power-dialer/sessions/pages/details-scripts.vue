<template>
  <q-card
    :disabled="sessionLoader"
    flat
    class="p-0">
    <q-card-section class="px-0" style="overflow:auto;">

      <ScriptSelector
        v-model="scriptId"
        class="px-3 w-100"
        @on-change="changeScript" />

      <div
        v-html="scriptText"
        class="t-scroll-y2 py-3 px-3"
        style="overflow:auto;">
      </div>

    </q-card-section>
  </q-card>
</template>

<script>

import { mapGetters } from 'vuex'
import ScriptSelector from 'components/generic-selectors/session-scripts-selector'

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
      'sessionLoader',
      'sessionSettings'
    ]),
    scriptText () {
      return this.script?.text
    },
    selectedScript: {
      get () {
        return this.scriptId
      },
      set (val) {
        this.$emit('change', val)
      }
    }
  },
  mounted () {
    this.scriptId = this.sessionSettings.script_id
  },
  data () {
    return {
      scriptId: null,
      script: ''
    }
  },
  methods: {
    changeScript (val) {
      console.log('val :>> ', val)
      this.script = val
    }
  }
}
</script>
