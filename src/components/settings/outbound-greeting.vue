<template>
  <div>
    <b-form-row>
      <b-col sm="12" md="12" class="mt-2">
        <b-form-group class="mb-0" label="">
          <b-form-checkbox switch
                           v-model="user.play_outbound_greeting"
                           @change="eventPayload => onUpdateFields(eventPayload, 'play_outbound_greeting')">
            Enable Outbound Greeting
          </b-form-checkbox>
          <p class="form-helper-text">Add a record or text to speech greeting message to be played on all your outbound calls.</p>
        </b-form-group>
      </b-col>

      <b-col sm="12"
             md="12"
             v-if="user.play_outbound_greeting">
        <p class="form-helper-text">You can record or upload an audio file for outgoing phone call notifications.</p>

        <q-tabs indicator-color="transparent"
                active-color="white"
                class="bg-primary text-grey-5 shadow-2"
                align="justify"
                narrow-indicator
                v-model="activeTab">
          <q-tab name="tts">
            <template v-slot>
              <div class="row items-center no-wrap">
                <i aria-hidden="true" role="img" class="q-icon on-left notranslate material-icons q-mr-xs">smart_toy</i>
                <span>Text to Speech</span>
              </div>
            </template>
          </q-tab>
          <q-tab name="upload">
            <template v-slot>
              <div class="row items-center no-wrap">
                <i aria-hidden="true" role="img" class="q-icon on-left notranslate material-icons q-mr-xs">play_arrow</i>
                <span>Play Recording</span>
              </div>
            </template>
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="tts">
            <div>
              <h5 class="form-label mb-2">Recording Message</h5>
              <div class="row no-wrap">
                <b-form-input type="text"
                              v-model="user.outbound_record_tts"
                              @input="eventPayload => onUpdateFields(eventPayload, 'outbound_record_tts')"
                              class="col h-auto" />
                <div class="d-flex align-items-center">
                  <b-button class="ml-1"
                            variant="primary"
                            title="Add Variable"
                            data-testid="tags-button-add-tag"
                            @click="showVariableSelector = true">
                    <i class="fa fa-plus"></i>
                    <span> Add Variable</span>
                  </b-button>
                  <q-menu content-class="mx-height-300"
                          ref="variablesMenu"
                          data-testid="outbound-greeting-add-variable-menu"
                          :offset="[0,5]">
                    <div class="row no-wrap q-pa-md">
                      <variables always-open
                                 data-testid="outbound-greeting-variables-selected"
                                 @variableSelected="variableSelected">
                      </variables>
                    </div>
                  </q-menu>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="upload">
            <outbound-greeting-drop-library :user="user"></outbound-greeting-drop-library>
          </q-tab-panel>
        </q-tab-panels>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import Variables from 'components/message-composer/options/variables'
import OutboundGreetingDropLibrary from 'components/outbound-greeting-drop-library'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'outbound-greeting',

  components: {
    Variables,
    OutboundGreetingDropLibrary
  },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      activeTab: this.user?.outbound_record_file ? 'upload' : 'tts',
      showVariableSelector: false
    }
  },

  watch: {
    'user.outbound_record_file': {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          this.activeTab = 'upload'
        }
      }
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapGetters('auth', ['profile'])
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties']),

    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })
    },

    variableSelected (variable) {
      this.user.outbound_record_tts = (this.user.outbound_record_tts ?? '') + ' ' + variable
      this.onUpdateFields(this.user.outbound_record_tts, 'outbound_record_tts')
    }
  }
}
</script>
