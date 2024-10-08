<template>
  <q-card class="p-0"
          flat
          :disabled="sessionLoader">
    <q-card-section class="px-0 d-flex flex-column h-100 overflow-hidden">
      <ScriptSelector class="px-3 w-100 flex-grow-0"
                      v-model="scriptId"
                      @on-change="changeScript" />
      <div class="t-scroll-y2 py-3 px-3 flex-grow-1"
           style="overflow:auto;"
           v-html="scriptText" />
    </q-card-section>
  </q-card>
</template>

<script>
import _ from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'
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
    ...mapState('powerDialer', [
      'activeTask'
    ]),

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

    this.changeScript()
  },

  data () {
    return {
      scriptId: null,
      script: ''
    }
  },

  methods: {
    ...mapActions('powerDialer', [
      'getTranslatedScript',
      'getLastCommunicationScript'
    ]),

    async changeScript (val) {
      let lastCommunicationId = _.get(this.activeTask, 'last_communication.id', null)

      // if last_communication isnt present, search in script directly
      if (!lastCommunicationId && this.scriptId && this.activeTask?.contact_id) {
        const res = await this.getTranslatedScript({
          id: this.activeTask.contact_id,
          params: {
            campaign_id: this.sessionSettings.campaign_id,
            phone_number: this.activeTask.contact_phone_number,
            script_id: this.selectedScript,
            user_id: this.activeTask.user_id
          }
        })

        this.script = res.data

        return
      }

      if (!lastCommunicationId) {
        return
      }

      let lastCommunicationData = await this.getLastCommunicationScript(lastCommunicationId)

      this.script = lastCommunicationData.data.find(script => {
        return script.id === this.selectedScript
      })
    }
  },

  watch: {
    async activeTask (value) {
      if (value && value.id) {
        await this.changeScript()
      }
    }
  }
}
</script>
