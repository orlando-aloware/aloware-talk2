<template>
  <b-container class="mb-4"
               fluid
               :class="horizontalPaddingClass">
    <b-row class="row-no-padding">
      <b-col class="pt-2"
             md="12"
             sm="12"
             :class="horizontalPaddingClass">
        <div class="d-inline-flex">
          <slot name="header">
          </slot>
          <h1 class="mt-2">Diagnosis</h1>
        </div>
      </b-col>
    </b-row>
    <b-row class="mb-2 mt-4 row-no-padding">
      <b-col class="text-center mb-2"
             md="12"
             sm="12">
        <b-button size="sm"
                  variant="success"
                  @click="diagnose">
          <i class="fa fa-redo"
             v-if="!isDiagnosing"/>
          <q-spinner-bars class="mt-n-5"
                          color="white"
                          v-if="isDiagnosing"/>
          {{ isDiagnosing ? 'Performing Diagnostic Test' : 'Refresh' }}

        </b-button>
        <br/>
        <i class="fa fs-20 mt-5"
           :class="diagnoseIconClass"
           v-if="!isDiagnosing"/>
      </b-col>
    </b-row>
    <b-row class="row-no-padding"
           v-if="diagnosis">
      <b-col class="text-center mb-2 mt-4"
             md="12"
             sm="12">
        <h5>{{ diagnosis.model.full_name || '' }}</h5>
        <p class="text-muted mt-2">Time of Test: {{ new Date() | momentFormat('MM/DD h:mma z', true) }}</p>
      </b-col>
      <b-col md="12"
             sm="12">
        <b-card-group>
          <b-card title="Status">
            <b-card-text v-if="!isDiagnosing">
              <b-badge class="contain-text"
                       variant="success"
                       pill
                       v-if="diagnosis.model.is_destination"> Available
              </b-badge>
              <b-badge class="contain-text"
                       pill
                       v-else>
                {{ AgentStatusLabels.LABELS.find(label => label.value === diagnosis.model.agent_status).label }}
              </b-badge>
            </b-card-text>
            <b-card-text v-if="isDiagnosing">
              <q-skeleton type="text"/>
            </b-card-text>
          </b-card>

          <b-card title="Diagnosis">
            <b-card-text v-if="!isDiagnosing">
              <b-list-group flush>
                <b-list-group-item class="d-flex justify-content-between align-items-center pl-0 pr-0 border-0"
                                   :key="result.key"
                                   v-for="result in diagnosis.results">
                  {{ result.label }}
                  <b-badge  variant="success"
                            pill
                            v-if="result.value">
                    <i class="fa fa-check"/>
                  </b-badge>
                  <b-badge variant="danger"
                           pill
                           v-else>
                    <i class="fa fa-times"/>
                  </b-badge>
                </b-list-group-item>
              </b-list-group>
            </b-card-text>
            <b-card-text v-if="isDiagnosing">
              <q-skeleton type="text"/>
            </b-card-text>
          </b-card>

          <b-card title="Can take calls?">
            <b-card-text v-if="!isDiagnosing">
              <b-badge class="contain-text"
                       variant="success"
                       pill
                       v-if="diagnosis.agent_is_eligible_to_take_call">Yes
              </b-badge>
              <b-badge class="contain-text"
                       variant="danger"
                       pill
                       v-else>No
              </b-badge>
            </b-card-text>
            <b-card-text v-if="isDiagnosing">
              <q-skeleton type="text"/>
            </b-card-text>
          </b-card>
        </b-card-group>

        <span class="font-italic fs-12">
          Please note that this utility does not look into contact / communication ownership.
        </span>
      </b-col>

      <b-col class="mt-4"
             md="12"
             sm="12"
             v-if="onGoingCalls.length > 0">
        <b-card header="On Going Calls"
                no-body>
          <b-list-group flush>
            <b-list-group-item class="d-flex justify-content-between align-items-center"
                               :key="onGoingCall.id"
                               v-for="onGoingCall in onGoingCalls">
              <b-media tag="li">
                <template #aside>
                  <inbound-call-o-icon v-if="onGoingCall.direction === CommunicationDirection.OUTBOUND"/>
                  <outbound-call-o-icon class="mt-1"
                                        v-else/>
                </template>
                {{ onGoingCall.direction === CommunicationDirection.OUTBOUND ? 'Outbound' : 'Inbound' }} call with
                <span class="mb-0">
                 {{ onGoingCall.contact.name }} ({{ onGoingCall.contact.phone_number | fixPhone }})
                </span>
                <span class="mb-0">
                 {{ onGoingCall.lead_number | fixPhone }}
                </span>
                <b-button class="mt-2"
                          size="sm"
                          variant="danger"
                          @click="terminateCall(onGoingCall.id)">Terminate
                </b-button>
              </b-media>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import * as AgentStatusLabels from 'src/constants/agent-status-labels'
import * as CommunicationDirection from 'src/constants/communication-direction'
import OutboundCallOIcon from 'components/icons/outbound-call-o-icon'
import InboundCallOIcon from 'components/icons/inbound-call-o-icon'
import { settingsLayoutMixin, kycMixin } from 'src/plugins/mixins'

export default {
  name: 'diagnosis',

  components: { InboundCallOIcon, OutboundCallOIcon },

  mixins: [
    settingsLayoutMixin,
    kycMixin
  ],

  props: {
    user: {
      required: true
    }
  },

  data () {
    return {
      diagnosis: null,
      isDiagnosing: false,
      onGoingCalls: [],
      AgentStatusLabels,
      CommunicationDirection
    }
  },

  computed: {
    diagnoseIconClass () {
      const iconClass = this.diagnosis?.agent_is_eligible_to_take_call
        ? 'fa-phone' : 'fa-phone-slash'

      return [
        iconClass
      ]
    }
  },

  methods: {
    diagnose () {
      this.isDiagnosing = true

      return talk2Api.V1.user.diagnosis(this.user.id)
        .then(response => {
          this.diagnosis = response.data.diagnosis
          this.onGoingCalls = response.data.on_going_calls
          this.isDiagnosing = false
        })
    },

    terminateCall (id) {
      return talk2Api.V1.communication.forceTerminate(id)
        .then(response => {
          this.diagnose()
        })
    }
  },

  mounted () {
    this.diagnose()
  }
}
</script>
