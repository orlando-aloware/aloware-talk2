<template>
<b-container class="mb-4">
  <b-row>
    <b-col sm="12" md="12">
      <div class="d-inline-flex">
        <h1 class="mt-2"> Diagnosis </h1>
      </div>
    </b-col>
  </b-row>
  <b-row class="mb-2 mt-4">
    <b-col sm="12" md="12" class="text-center mb-2">
      <b-button variant="success"
                size="sm"
                @click="diagnose">
        <i class="fa fa-redo" v-if="!isDiagnosing"></i>
        <q-spinner-bars v-if="isDiagnosing" color="white"/>
        {{ isDiagnosing ? 'Performing Diagnostic Test' : 'Refresh' }}

      </b-button>
      <br/>
      <i class="fa fa-phone-slash fs-20 mt-5"></i>
    </b-col>
  </b-row>
  <b-row v-if="isDiagnosing || !diagnosis">
    <b-col sm="12" md="12" class="text-center mb-2 mt-4">

      <h5><q-skeleton type="rect"></q-skeleton></h5>
      <p class="text-muted mt-2"><q-skeleton type="rect"></q-skeleton></p>
    </b-col>
    <b-col sm="12" md="12">
      <b-card no-body header="Diagnosis">
        <b-list-group flush>
          <q-item style="max-width: 300px" class="pl-3 pr-2">
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" width="65%" />
              </q-item-label>
            </q-item-section>
          </q-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center">
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center">
            Can take calls?
            <q-skeleton type="circle" size="20px"></q-skeleton>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center">
            Status
            <q-skeleton type="circle" size="20px"></q-skeleton>
          </b-list-group-item>
        </b-list-group>

        <b-card-body class="text-italic fs-12">
          Please note that this utility does not look into contact / communication ownership.
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
  <b-row v-if="!isDiagnosing && diagnosis">
    <b-col sm="12" md="12" class="text-center mb-2 mt-4">

      <h5>{{ diagnosis.model.full_name }}</h5>
      <p class="text-muted mt-2">Time of Test: {{ new Date() | momentFormat('MM/DD h:mma z', true) }}</p>
    </b-col>
    <b-col sm="12" md="12">
      <b-card no-body header="Diagnosis">
        <b-list-group flush>
          <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="result in diagnosis.results" :key="result.key">
            {{ result.label }}
            <b-badge variant="success" pill v-if="result.value"><i class="fa fa-check"></i></b-badge>
            <b-badge variant="danger" pill v-else><i class="fa fa-times"></i></b-badge>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center">
            Can take calls?
            <b-badge variant="success" pill v-if="diagnosis.agent_is_eligible_to_take_call"><i class="fa fa-check"></i></b-badge>
            <b-badge variant="danger" pill v-else><i class="fa fa-times"></i></b-badge>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center">
            Status
            <b-badge variant="success" pill v-if="diagnosis.model.is_destination"> Available </b-badge>
            <b-badge pill v-else>
              {{ AgentStatusLabels.LABELS.find(label => label.value === diagnosis.model.agent_status).label }}
            </b-badge>
          </b-list-group-item>
        </b-list-group>

        <b-card-body class="text-italic fs-12">
          Please note that this utility does not look into contact / communication ownership.
        </b-card-body>
      </b-card>
    </b-col>

    <b-col sm="12" md="12" class="mt-4" v-if="onGoingCalls.length > 0">
      <b-card no-body header="On Going Calls">
        <b-list-group flush>
          <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="onGoingCall in onGoingCalls" :key="onGoingCall.id">
            <b-media tag="li">
              <template #aside>
                <inbound-call-o-icon v-if="ongoingCall.direction === CommunicationDirection.OUTBOUND"></inbound-call-o-icon>
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
