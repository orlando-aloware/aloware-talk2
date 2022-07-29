<template>
<b-container fluid class="mb-4">
  <b-row class="row-no-padding">
    <b-col sm="12" md="12">
      <div class="d-inline-flex">
        <slot name="header">
        </slot>
        <h1 class="mt-2"> Diagnosis </h1>
      </div>
    </b-col>
  </b-row>
  <b-row class="mb-2 mt-4 row-no-padding">
    <b-col sm="12" md="12" class="text-center mb-2">
      <b-button variant="success"
                size="sm"
                @click="diagnose">
        <i class="fa fa-redo" v-if="!isDiagnosing"></i>
        <q-spinner-bars v-if="isDiagnosing"
                        class="mt-n-5"
                        color="white"/>
        {{ isDiagnosing ? 'Performing Diagnostic Test' : 'Refresh' }}

      </b-button>
      <br/>
      <i class="fa fs-20 mt-5"
         v-if="!isDiagnosing"
         :class="[diagnosis && diagnosis.agent_is_eligible_to_take_call ? 'fa-phone' : 'fa-phone-slash']"></i>
    </b-col>
  </b-row>
  <b-row class="row-no-padding"
         v-if="diagnosis">
    <b-col sm="12" md="12" class="text-center mb-2 mt-4">

      <h5>{{ diagnosis.model.full_name || '' }}</h5>
      <p class="text-muted mt-2">Time of Test: {{ new Date() | momentFormat('MM/DD h:mma z', true) }}</p>
    </b-col>
    <b-col sm="12" md="12">
      <b-card-group>
        <b-card title="Status">
          <b-card-text v-if="!isDiagnosing">
            <b-badge variant="success"
                     class="contain-text"
                     pill
                     v-if="diagnosis.model.is_destination"> Available </b-badge>
            <b-badge pill
                     class="contain-text"
                     v-else>
              {{ AgentStatusLabels.LABELS.find(label => label.value === diagnosis.model.agent_status).label }}
            </b-badge>
          </b-card-text>
          <b-card-text v-if="isDiagnosing">
            <q-skeleton type="text" />
          </b-card-text>
        </b-card>

        <b-card title="Diagnosis">
          <b-card-text v-if="!isDiagnosing">
            <b-list-group flush>
              <b-list-group-item class="d-flex justify-content-between align-items-center pl-0 pr-0 border-0"
                                 v-for="result in diagnosis.results"
                                 :key="result.key">
                {{ result.label }}
                <b-badge variant="success" pill v-if="result.value"><i class="fa fa-check"></i></b-badge>
                <b-badge variant="danger" pill v-else><i class="fa fa-times"></i></b-badge>
              </b-list-group-item>
            </b-list-group>
          </b-card-text>
          <b-card-text v-if="isDiagnosing">
            <q-skeleton type="text" />
          </b-card-text>
        </b-card>

        <b-card title="Can take calls?">
          <b-card-text v-if="!isDiagnosing">
            <b-badge variant="success"
                     class="contain-text"
                     pill
                     v-if="diagnosis.agent_is_eligible_to_take_call">Yes</b-badge>
            <b-badge variant="danger"
                     class="contain-text"
                     pill
                     v-else>No</b-badge>
          </b-card-text>
          <b-card-text v-if="isDiagnosing">
            <q-skeleton type="text" />
          </b-card-text>
        </b-card>
      </b-card-group>

        <span class="font-italic fs-12">
          Please note that this utility does not look into contact / communication ownership.
        </span>
    </b-col>

    <b-col sm="12" md="12" class="mt-4" v-if="onGoingCalls.length > 0">
      <b-card no-body header="On Going Calls">
        <b-list-group flush>
          <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="onGoingCall in onGoingCalls" :key="onGoingCall.id">
            <b-media tag="li">
              <template #aside>
                <inbound-call-o-icon v-if="onGoingCall.direction === CommunicationDirection.OUTBOUND"></inbound-call-o-icon>
                <outbound-call-o-icon v-else class="mt-1"></outbound-call-o-icon>
              </template>
              {{ onGoingCall.direction === CommunicationDirection.OUTBOUND ? 'Outbound' : 'Inbound' }} call with
              <span class="mb-0">
                 {{ onGoingCall.contact.name }} ({{ onGoingCall.contact.phone_number | fixPhone }})
              </span>
              <span class="mb-0">
                 {{ onGoingCall.lead_number | fixPhone }}
              </span>
              <b-button variant="danger"
                        size="sm"
                        class="mt-2"
                        @click="terminateCall(onGoingCall.id)">Terminate</b-button>
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

export default {
  name: 'diagnosis',
  components: { InboundCallOIcon, OutboundCallOIcon },
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

  methods: {
    diagnose () {
      this.isDiagnosing = true
      return talk2Api.V1.user.diagnosis(this.user.id).then(response => {
        this.diagnosis = response.data.diagnosis
        this.onGoingCalls = response.data.on_going_calls
        this.isDiagnosing = false
      })
    },
    terminateCall (id) {
      return talk2Api.V1.communication.forceTerminate(id).then(response => {
        this.diagnose()
      })
    }
  },
  mounted () {
    this.diagnose()
  }
}
</script>

<style scoped>

</style>
