<template>
  <div class="container-fluid mt-2 mb-2">
    <communication-details v-if="!hasError && communication" :communication="communication"
                           :verbose="true">
    </communication-details>
    <b-row v-else>
      <b-col md="4"
             sm="12"
             class="pl-0 pr-0">
          <q-card flat bordered class="my-card">
            <q-card-section class="text-center">
               <span class="material-icons fs-45">
                error_outline
              </span>
            </q-card-section>

            <q-card-section class="q-pt-none text-center">
              We could not find the requested resource.
            </q-card-section>
          </q-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>

import talk2Api from 'src/plugins/api/api'
import CommunicationDetails from 'components/communication-details'

export default {
  name: 'Communication',
  components: { CommunicationDetails },
  data () {
    return {
      communicationId: null,
      communication: null,
      hasError: false
    }
  },

  methods: {
    getCommunication (id) {
      this.hasError = false
      talk2Api.V1.communication.get(id)
        .then(res => {
          this.communication = res.data
        }).catch(err => {
          this.hasError = true
          console.log(err)
        })
    }
  },

  mounted () {
    if (this.$route.name === 'Communication' && this.$route.params.communicationId) {
      this.communicationId = this.$route.params.communicationId
    }
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
