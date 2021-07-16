<template>
  <div>
    <b-form @submit.prevent="onSubmit">
      <b-form-group
        id="input-group-1"
        label-for="input-1"
        description="Choose the sequence you want this contact to enroll"
      >
        <sequence-selector @change="onSequenceSelected"></sequence-selector>
      </b-form-group>
      <b-button size="sm" type="submit" variant="primary" :disabled="isEnrolling || !sequence">
        <q-spinner-bars v-if="isEnrolling" color="white" />
        {{ isEnrolling ? 'Enrolling Contact...' : 'Enroll Contact' }}
        </b-button>
    </b-form>
  </div>
</template>

<script>

import SequenceSelector from 'components/sequence-selector'
import talk2Api from 'src/plugins/api/api'
import { mapGetters } from 'vuex'

export default {
  name: 'enroll-sequence',
  components: { SequenceSelector },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      isOpen: true,
      isEnrolling: false,
      sequence: null
    }
  },
  methods: {
    onSequenceSelected (sequence) {
      this.sequence = sequence
    },
    onSubmit (event) {
      event.preventDefault()
      this.isEnrolling = true
      talk2Api.V1.automations.workflows.enroll(this.sequence.id, { id: this.contact.id, model: 'contact' })
        .then(response => {
          this.$emit('close')
          this.$q.notify({
            type: 'positive',
            textColor: 'white',
            message: 'Contact has been enrolled to sequence.',
            position: 'bottom-right'
          })
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            textColor: 'white',
            message: 'Error while enrolling contact to sequence.',
            position: 'bottom-right'
          })
        }).finally(() => {
          this.isEnrolling = false
        })
    }
  }
}
</script>

<style scoped>

</style>
