<template>
  <div class="container-fluid mt-2 mb-2">
    <communication-details :communication="communication"
                           :verbose="true"></communication-details>
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
      communication: null
    }
  },

  methods: {
    getCommunication (id) {
      talk2Api.V1.communication.get(id)
        .then(res => {
          this.communication = res.data
        }).catch(err => {
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
