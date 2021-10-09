<template>
  <b-modal title="Add Reminder"
           size="md"
           v-model="isOpen"
           @hidden="onHidden">
    <b-form @submit.prevent="onSubmit">
      <b-form-group
        id="input-group-1"
        label=""
        label-for="input-1"
      >
        <date-selector :min-date="minDate"
                       @dateSelected="dateSelected">
        </date-selector>
      </b-form-group>

      <b-form-group id="input-group-2"
                    label=""
                    label-for="input-2">
        <predefined-time-selector v-model="time"
                                  @select="onTimeSelected">
        </predefined-time-selector>
      </b-form-group>

      <b-form-group id="input-group-2"
                    label-for="input-2">
        <b-form-textarea
          id="textarea-no-auto-shrink"
          placeholder="Reminder notes"
          rows="3"
          max-rows="8"
          no-auto-shrink
          v-model="reminder.note"
        ></b-form-textarea>
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
      <b-button type="button"
                size="sm"
                variant="primary"
                :disabled="isAdding || !isValid"
                @click="onSubmit">
        <q-spinner-bars v-if="isAdding" color="white" />
        {{ isAdding ? 'Adding Reminder...' : 'Add Reminder' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapGetters, mapActions, mapState } from 'vuex'
import PredefinedTimeSelector from 'components/predefined-time-selector'
import DateSelector from 'components/date-selector'

export default {
  name: 'contact-add-reminder-modal',
  components: { DateSelector, PredefinedTimeSelector },
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', ['isAddReminderOpen']),
    ...mapState('auth', ['profile']),
    isValid () {
      return this.reminder.date && this.reminder.time && this.reminder.note
    },
    minDate () {
      return window.moment().format('YYYY-MM-DD')
    },
    isOpen: {
      get () {
        return this.isAddReminderOpen
      },
      set (isOpen) {
        return isOpen
      }
    }
  },
  data () {
    return {
      date: '',
      time: '',
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
    ...mapActions('contacts', ['addReminderOpen']),
    onSubmit (event) {
      event.preventDefault()
      this.isAdding = true
      talk2Api.V1.contact.addEngagement(this.contact.id, this.formatParameters())
        .then(response => {
          this.onHidden()
          this.$generalNotification('Reminder has been added.')
        }).catch(error => {
          console.log(error)
          this.$generalNotification('Error while adding reminder.', 'error')
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
        time: this.reminder.time,
        timezone: this.profile.timezone,
        type: 13
      }
    },
    onHidden () {
      this.addReminderOpen(false)
    },
    dateSelected (value) {
      this.reminder.date = window.moment(value).format('MM/DD/YYYY')
      // enable this when the vue-date-time-selector is working properly
      // this.reminder.time = window.moment(value).format('hh:mm')
    }
  },
  watch: {
    'isAddReminderOpen': function (value) {
      this.isOpen = value
    }
  }
}
</script>
