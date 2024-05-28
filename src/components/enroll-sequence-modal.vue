<template>
  <b-modal title="Enroll To Sequence"
           size="md"
           v-model="isOpen"
           data-testid="enroll-sequence-modal"
           @hidden="onHidden"
           @shown="onShown">
    <b-form @submit.prevent="onSubmit" data-testid="enroll-sequence-modal-form">
      <b-form-group
        id="input-group-1"
        label-for="input-1"
        description="Choose the sequence you want this contact to enroll"
        data-testid="enroll-sequence-modal-form-group"
      >
        <sequence-selector ref="sequenceSelector"
                           :multiple="false"
                           :use-chips="false"
                           :clearable="true"
                           :generic-styling="false"
                           data-testid="enroll-sequence-modal-sequence-selector"
                           @change="onSequenceSelected"/>
      </b-form-group>
    </b-form>
    <template slot="modal-footer">
      <b-button variant="success"
                class="custom-btn"
                size="sm"
                data-testid="enroll-sequence-modal-close-button"
                @click="onHidden"
      >
        Close
      </b-button>
      <b-button variant="primary"
                class="custom-btn"
                size="sm"
                :disabled="isEnrolling || !sequenceId"
                data-testid="enroll-sequence-modal-enroll-contact-button"
                @click="onSubmit"
      >
        <q-spinner-bars v-if="isEnrolling"
                        color="white" />
        {{ isEnrolling ? 'Enrolling Contact...' : 'Enroll Contact' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import SequenceSelector from 'components/generic-selectors/sequence-selector'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  name: 'enroll-sequence-modal',

  components: { SequenceSelector },

  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', ['isEnrollSequenceOpen']),
    isOpen: {
      get () {
        return this.isEnrollSequenceOpen
      },
      set (isOpen) {
        return isOpen
      }
    }
  },

  data () {
    return {
      isEnrolling: false,
      sequenceId: null
    }
  },

  methods: {
    ...mapActions('contacts', ['enrollSequenceOpen']),
    onSequenceSelected (sequenceId) {
      this.sequenceId = sequenceId
    },
    onSubmit (event) {
      event.preventDefault()
      this.isEnrolling = true
      talk2Api.V1.automations.workflows.enroll(this.sequenceId, { id: this.contact.id, model: 'contact' })
        .then(response => {
          this.enrollSequenceOpen(false)
          this.$VueEvent.fire('contactSequenceEnrolled', this.contact.id)
          this.$generalNotification('Contact has been enrolled to sequence.')
        }).catch(error => {
          console.log(error)
          this.$generalNotification('Error while enrolling contact to sequence.', 'error')
        }).finally(() => {
          this.isEnrolling = false
        })
    },
    onHidden () {
      this.enrollSequenceOpen(false)
    },
    onShown () {
      this.$nextTick(() => {
        if (this.$refs.sequenceSelector) {
          const inputElement = this.$refs.sequenceSelector.$el.querySelector('input')
          if (inputElement) {
            inputElement.focus()
          }
        }
      })
    }
  },
  watch: {
    isEnrollSequenceOpen: function (value) {
      this.open = value
    }
  }
}
</script>
