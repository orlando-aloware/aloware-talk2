<template>
  <b-modal title="Add Reminder"
           size="md"
           v-model="isAddReminderOpen"
           @hidden="onHidden">
    <b-form @submit.prevent="onSubmit">
      <b-form-group
        id="input-group-1"
        label=""
        label-for="input-1"
      >

        <vue-ctk-date-time-picker formatted="lll"
                                  label="Select date"
                                  :inline="true"
                                  :no-label="true"
                                  :no-header="false"
                                  :format="`YYYY-MM-DD HH:mm`"
                                  :no-button-now="true"
                                  :auto-close="true"
                                  :minute-interval="5"
                                  :disabled-hours="['00','01','02','03','04', '05']"
                                  v-model="date" @input="dateSelected">
        </vue-ctk-date-time-picker>

<!--        <vue-ctk-date-time-picker formatted="l"-->
<!--                                  :inline="true"-->
<!--                                  label="Select date"-->
<!--                                  :only-date="false"-->
<!--                                  :no-label="true"-->
<!--                                  :format="`MM/DD/YYYY`"-->
<!--                                  :auto-close="true"-->
<!--                                  v-model="reminder.date">-->
<!--        </vue-ctk-date-time-picker>-->
      </b-form-group>

      <b-form-group id="input-group-2" label="" label-for="input-2">
<!--        <predefined-time-selector @select="onTimeSelected"></predefined-time-selector>-->
      </b-form-group>

      <b-form-group id="input-group-2" label-for="input-2">
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
      <b-button type="submit" size="sm" variant="primary" :disabled="isAdding || !isValid">
        <q-spinner-bars v-if="isAdding" color="white" />
        {{ isAdding ? 'Adding Reminder...' : 'Add Reminder' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>

import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
import talk2Api from 'src/plugins/api/api'
import { mapGetters, mapActions, mapState } from 'vuex'
// import PredefinedTimeSelector from 'pages/contacts/_components/predefined-time-selector'
export default {
  name: 'contact-add-reminder-modal',
  components: { VueCtkDateTimePicker },
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', ['isAddReminderOpen']),
    isValid () {
      return this.reminder.date && this.reminder.time && this.reminder.note
    }
  },
  data () {
    return {
      date: '',
      isAdding: false,
      isOpen: false,
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
          this.$emit('close')
          this.$q.notify({
            message: 'Reminder has been added.',
            type: 'positive',
            textColor: 'white',
            position: 'bottom-right'
          })
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            message: 'Error while adding reminder.',
            type: 'negative',
            textColor: 'white',
            position: 'bottom-right'
          })
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
    },
    onHidden () {
      this.addReminderOpen(false)
    },
    dateSelected (value) {
      this.reminder.date = window.moment(value).format('MM/DD/YYYY')
      this.reminder.time = window.moment(value).format('hh:mm')
    }
  },
  watch: {
    'isAddReminderOpen': function (value) {
      this.isOpen = value
    }
  }
}
</script>

<style scoped>
.time-picker-column::-webkit-scrollbar {
  display: block !important;
}
</style>
