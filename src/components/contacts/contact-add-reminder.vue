<template>
  <div>
    <b-form @submit.prevent="onSubmit" data-testid="contact-add-reminder-form">
      <b-form-group
        id="input-group-1"
        label=""
        label-for="input-1"
      >
        <vue-ctk-date-time-picker formatted="l"
                                  label="Select date"
                                  :only-date="true"
                                  :no-label="true"
                                  :format="`MM/DD/YYYY`"
                                  :auto-close="true"
                                  data-testid="contact-add-reminder-date-time-picker"
                                  v-model="reminder.date">
        </vue-ctk-date-time-picker>
      </b-form-group>

      <b-form-group id="input-group-2" label="" label-for="input-2">
        <predefined-time-selector data-testid="contact-add-reminder-predefined-time-selector" @select="onTimeSelected"></predefined-time-selector>
      </b-form-group>

      <b-form-group id="input-group-2" label-for="input-2">
        <b-form-textarea
          id="textarea-no-auto-shrink"
          placeholder="Reminder notes"
          rows="3"
          max-rows="8"
          no-auto-shrink
          data-testid="contact-add-reminder-notes-textarea"
          v-model="reminder.note"
        ></b-form-textarea>
      </b-form-group>

      <b-button type="submit"
                size="sm"
                variant="primary"
                data-testid="contact-add-reminder-submit-button"
                :disabled="isAdding || !isValid">
        <q-spinner-bars v-if="isAdding" color="white" />
        {{ isAdding ? 'Adding Reminder...' : 'Add Reminder' }}
      </b-button>
    </b-form>
  </div>
</template>

<script>
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
import talk2Api from 'src/plugins/api/api'
import { mapGetters } from 'vuex'
import PredefinedTimeSelector from 'components/predefined-time-selector'
export default {
  name: 'contact-add-reminder',
  components: { PredefinedTimeSelector, VueCtkDateTimePicker },
  computed: {
    ...mapGetters('contacts', ['contact']),
    isValid () {
      return this.reminder.date && this.reminder.time && this.reminder.note
    }
  },
  data () {
    return {
      isAdding: false,
      reminder: {
        date: '',
        time: '',
        note: '',
        timezone: ''
      }
    }
  },
  methods: {
    onSubmit (event) {
      event.preventDefault()
      this.isAdding = true
      talk2Api.V1.contact.addEngagement(this.contact.id, this.formatParameters())
        .then(response => {
          this.$emit('close')
          this.$generalNotification('Reminder has been added.')
        }).catch(error => {
          console.log(error)
          this.$handleErrors(error.response)
        }).finally(() => {
          this.isAdding = false
        })
    },
    onTimeSelected (value) {
      this.reminder.time = value.value
    },
    formatParameters () {
      return {
        body: this.reminder.note,
        date: this.reminder.date,
        time: this.reminder.time.value,
        timezone: '',
        type: 13
      }
    }
  }
}
</script>
