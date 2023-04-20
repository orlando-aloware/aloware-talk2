<template>
  <q-card class="bg-grey-1 h-100"
          flat
          :disabled="sessionLoader">
    <div class="contact-info-wrapper pb-2 flex-column">
      <ContactPhones no-bottom-padding />
      <b-card class="d-inline-flex flex-wrap contact-action-button border-0 w-100"
              no-body>
        <b-card-body class="pt-1">
          <b-button variant="light"
                    size="sm"
                    class="custom-action-button my-1"
                    :disabled="contact.is_dnc"
                    @click="addAppointmentOpen(true)">
            <q-tooltip anchor="bottom middle"
                       self="center middle">
              Add appointment
            </q-tooltip>
            <calendar-icon />
          </b-button>
          <b-button variant="light"
                    size="sm"
                    class="custom-action-button my-1"
                    :disabled="contact.is_dnc"
                    @click="addReminderOpen(true)">
            <q-tooltip anchor="bottom middle"
                       self="center middle">
              Add reminder
            </q-tooltip>
            <timer-icon />
          </b-button>
        </b-card-body>
      </b-card>
    </div>
    <div class="pb-2">
      <ContactTags :contact="contact" />
    </div>
    <div style="padding-bottom: 100px;">
      <ContactNotes :contact="contact"
                    @input="onNotesInput" />
    </div>
  </q-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactPhones from 'components/contacts/contact-phones'
import ContactTags from 'components/generic-selectors/contact-tags'
import ContactNotes from 'components/contacts/contact-notes'
import TimerIcon from 'src/components/icons/timer-icon'
import CalendarIcon from 'src/components/icons/calendar-icon'

export default {
  name: 'DetailsTools',

  components: {
    ContactPhones,
    ContactTags,
    ContactNotes,
    TimerIcon,
    CalendarIcon
  },

  computed: {
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),

    ...mapGetters('contacts', [
      'contact'
    ])
  },

  methods: {
    ...mapActions('contacts', [
      'updateChangedContactProperties',
      'addAppointmentOpen',
      'addReminderOpen'
    ]),

    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    }
  }
}
</script>
