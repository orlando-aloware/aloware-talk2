<template>
  <b-modal title="Enroll To Sequence"
           size="md"
           v-model="isEnrollSequenceOpen"
           @hidden="onHidden">
    <b-form @submit.prevent="onSubmit">
      <b-form-group
        id="input-group-1"
        label-for="input-1"
        description="Choose the sequence you want this contact to enroll"
      >
        <sequence-selector @change="onSequenceSelected"></sequence-selector>
      </b-form-group>
    </b-form>
    <template slot="modal-footer">
      <b-button
        variant="success"
        class="custom-btn"
        size="sm"
        @click="onHidden"
      >
        Close
      </b-button>
      <b-button
        variant="primary"
        class="custom-btn"
        size="sm"
        :disabled="isEnrolling || !sequence"
        @click="onSubmit"
      >
        <q-spinner-bars v-if="isEnrolling" color="white" />
        {{ isEnrolling ? 'Enrolling Contact...' : 'Enroll Contact' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import SequenceSelector from 'pages/contacts/_components/sequence-selector'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  name: 'enroll-sequence-modal',
  components: { SequenceSelector },
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', ['isEnrollSequenceOpen'])
  },
  data () {
    return {
      isOpen: false,
      isEnrolling: false,
      sequence: null
    }
  },
  methods: {
    ...mapActions('contacts', ['enrollSequenceOpen']),
    onSequenceSelected (sequence) {
      this.sequence = sequence
    },
    onSubmit (event) {
      event.preventDefault()
      this.isEnrolling = true
      talk2Api.V1.automations.workflows.enroll(this.sequence.id, { id: this.contact.id, model: 'contact' })
        .then(response => {
          this.enrollSequenceOpen(false)
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
    },
    onHidden () {
      this.enrollSequenceOpen(false)
    }
  },
  watch: {
    isEnrollSequenceOpen: function (value) {
      this.open = value
    }
  }
}
</script>

<style scoped>

</style>
