<template>
  <call-disposition-selector v-model="callDispositionId"
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
        this.$q.notify({
          offset: 95,
          title: 'Communication',
          message: 'Call disposed',
          type: 'success',
          showClose: true
        })
      }).catch((err) => {
        this.loadingCallDisposition = false
        console.log(err)
      })
    }
  }
}
</script>
