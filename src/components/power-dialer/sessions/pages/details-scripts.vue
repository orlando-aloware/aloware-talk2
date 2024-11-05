<template>
  <q-card class="p-0"
          flat
          :disabled="sessionLoader">
    <q-card-section class="px-0 d-flex flex-column h-100 overflow-hidden">
      <ScriptSelector class="px-3 w-100 flex-grow-0"
                      v-model="scriptId"
                      @change="changeScript" />
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
import talk2Api from 'src/plugins/api/api'
import { visibilityMixin } from 'src/plugins/mixins'

export default {
  name: 'DetailsScripts',

  components: {
    ScriptSelector
  },

  mixins: [
    visibilityMixin
  ],

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

  created () {
    this.listeners.newCommunication = async (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        // Mark that new_communication has been processed
        this.communicationProcessed = true
        this.communicationId = communication.id

        console.log('PLA-368: Listener Cached Scripts:', this.cachedScripts)
        console.log('PLA-368: Listener Communication ID:', this.communicationId)

        // Call the API for all cached scripts
        try {
          await Promise.all(this.cachedScripts.map(script => {
            if (script.id && this.communicationId) {
              return talk2Api.V1.scriptCommunication.store({
                script_id: script.id,
                communication_id: this.communicationId,
                text: script.text
              }).catch(err => {
                console.log('Error storing script communication:', err)
              })
            }
          }))
        } catch (err) {
          console.log('Error processing cached scripts:', err)
        } finally {
          // Clear the cached scripts after processing
          this.cachedScripts = []
          console.log('All cached scripts processed')
        }
      }
    }

    this.$VueEvent.listen('new_communication', this.listeners.newCommunication)
  },

  mounted () {
    this.scriptId = this.sessionSettings.script_id

    this.changeScript()
  },

  data () {
    return {
      scriptId: null,
      script: '',
      cachedScripts: [],
      communicationId: null,
      communicationProcessed: false,
      listeners: {}
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

        // Cache the script change
        this.cachedScripts.push({ id: this.selectedScript, text: this.script.text })

        return
      }

      if (!lastCommunicationId) {
        return
      }

      let lastCommunicationData = await this.getLastCommunicationScript(lastCommunicationId)

      this.cachedScripts.push({ id: this.selectedScript, text: this.script.text })

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
    },

    cachedScripts: {
      handler (newVal) {
        if (newVal.length > 0 && this.communicationProcessed) {
          console.log('PLA-368: Watcher Cached Scripts:', this.cachedScripts)
          console.log('PLA-368: Watcher Communication ID:', this.communicationId)

          let lastCommunicationId = _.get(this.activeTask, 'last_communication.id', this.communicationId)

          newVal.forEach(async (script) => {
            try {
              if (script.id && lastCommunicationId) {
                await talk2Api.V1.scriptCommunication.store({
                  script_id: script.id,
                  communication_id: lastCommunicationId,
                  text: script.text
                })
              }
            } catch (err) {
              console.log('Error storing script communication:', err)
            }
          })

          this.cachedScripts = []
        }
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('new_communication', this.listeners.newCommunication)
  }
}
</script>
