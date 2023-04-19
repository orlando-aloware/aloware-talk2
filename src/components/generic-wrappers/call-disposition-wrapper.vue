<template>
  <call-disposition-selector :highlighted="highlighted"
                             :highlighted-class="highlightedClass"
                             :required="required"
                             v-model="callDispositionId"
                             @change="changeCallDisposition">
  </call-disposition-selector>
</template>

<script>
import CallDispositionSelector from 'components/generic-selectors/call-disposition-selector'

export default {
  name: 'call-disposition-wrapper',

  components: { CallDispositionSelector },

  props: {
    communication: {
      required: true
    },

    highlighted: {
      type: Boolean,
      default: false
    },

    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },

    required: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loadingCallDisposition: false,
      callDispositionId: null
    }
  },

  mounted () {
    this.callDispositionId = this.communication.call_disposition_id
  },

  methods: {
    changeCallDisposition (callDispositionId) {
      this.loadingCallDisposition = true
      this.$axios.post('/api/v1/communication/' + this.communication.id + '/dispose-call', {
        call_disposition_id: callDispositionId
      }).then((res) => {
        this.loadingCallDisposition = false
        this.callDispositionId = callDispositionId
        this.$emit('change', callDispositionId)
        this.$generalNotification('Call disposition updated.')
      }).catch((err) => {
        this.loadingCallDisposition = false
        console.log(err)
        this.$handleErrors(err.response)
        this.$emit('change', callDispositionId)
      })
    }
  },

  watch: {
    'communication.call_disposition_id': function (newValue) {
      this.callDispositionId = newValue
    }
  }
}
</script>
