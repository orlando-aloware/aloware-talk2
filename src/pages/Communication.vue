<template>
  <div class="container-fluid mt-2 mb-2">
    <b-overlay class="h-100 w-100 communication-overlay"
               variant="white"
               rounded="sm"
               :show="isLoadingCommunication"
               data-testid="communication-screen"
               :opacity="0.85">
      <communication-details :verbose="true"
                             :communication="communication"
                             :is-contact-read-only="isContactReadOnly"
                             data-testid="comm-communication-details"
                             v-if="!hasError && communication">
      </communication-details>
      <b-row v-else-if="hasError && !isLoadingCommunication">
        <b-col md="4"
               sm="12"
               class="pl-0 pr-0">
          <q-card flat
                  bordered
                  class="my-card">
            <q-card-section class="text-center" data-testid="communication-error-outline">
                 <span class="material-icons fs-45">
                  error_outline
                </span>
            </q-card-section>

            <q-card-section class="q-pt-none text-center" data-testid="communication-not-find-request">
              We could not find the requested resource.
            </q-card-section>
          </q-card>
        </b-col>
      </b-row>

      <template #overlay>
        <div class="text-center" data-testid="communication-fetching-communication">
          <q-spinner-bars color="primary"
                          size="2em" />
          <p>Fetching Communication...</p>
        </div>
      </template>
    </b-overlay>
  </div>
</template>

<script>

import _ from 'lodash'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'
import CommunicationDetails from 'components/communication-details'
import { userMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'Communication',

  mixins: [
    userMixin
  ],

  components: {
    CommunicationDetails
  },

  data () {
    return {
      communicationId: null,
      communication: null,
      hasError: false,
      isLoadingCommunication: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isContactReadOnly () {
      return Boolean(this.communication?.contact?.is_read_only) || false
    }
  },

  methods: {
    getCommunication (id) {
      this.isLoadingCommunication = true
      this.hasError = false

      talk2TeamInboxApi.communication.show(id)
        .then(res => {
          this.communication = res.data
        }).catch(err => {
          this.hasError = true
          console.log(err)
        }).finally(() => {
          this.isLoadingCommunication = false
        })
    }
  },

  mounted () {
    if (this.$route.name === 'Communication' && this.$route.params.communicationId) {
      this.communicationId = this.$route.params.communicationId
    }

    this.$VueEvent.listen('update_communication', (data) => {
      if (this.communication && this.communication.id === data.id) {
        data = _.merge(this.communication, data)
        this.communication = data
      }
    })
  },

  beforeDestroy () {
    this.$VueEvent.stop('update_communication')
  },

  watch: {
    communicationId: function (value) {
      if (value) {
        this.getCommunication(this.communicationId)
      }
    },

    '$route.params.communicationId': function (value) {
      this.communicationId = value
      if (this.$route.name === 'Communication' && this.communicationId) {
        this.getCommunication(this.communicationId)
      }
    }
  }
}
</script>
