<template>
  <b-card class="border-0 contact-info-wrapper">
    <b-media>
      <template #aside>
        <q-item-section avatar>
          <avatar :name="contact.name"
                  class="contact-avatar"
                  width="40"
                  height="40">
          </avatar>
        </q-item-section>
      </template>

      <div class="d-flex justify-content-between relative-position">
        <div>
          <h2 class="mt-1 mb-0 contact-name">
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ contactName }}
            </q-tooltip>
            {{ contactName | truncate(15) }}
          </h2>
          <p class="contact-phone">
            <span v-if="contact.phone_number !== '0'">
              {{ contact.phone_number | fixPhone }}
              <b-badge v-if="phone && $options.filters.validLrnType(phone.lrn_type)"
                       :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
                       class="badge-phone-info">
                {{ phone.lrn_type | fixLrnType }}
              </b-badge>

              <b-link href="#"
                      class="copy-phone-number ml-1"
                      @click.prevent="copyPhoneNumber">
                <q-tooltip anchor="top middle"
                            self="center middle">
                  Copy
                </q-tooltip>
                <i class="material-icons">content_copy</i>
              </b-link>
              <input :value="contact.phone_number"
                     type="hidden"
                     id="phone-number-clone"/>
            </span>
            <span v-else>
              Phone number unavailable
            </span>
          </p>
        </div>
        <b-button class="btn-edit-contact-info btn-bg-transparent btn-b-0"
                  size="sm"
                  variant="light"
                  id="btn-edit-contact-info">
          <pencil-o-icon></pencil-o-icon>
        </b-button>
        <b-popover custom-class="edit-form-popover z-index-1"
                   target="btn-edit-contact-info"
                   triggers="focus"
                   :show.sync="showEditForm">
          <contact-name-form @close="onCloseEditForm"></contact-name-form>
        </b-popover>
      </div>
    </b-media>
    <div class="d-inline-flex flex-wrap contact-action-button">
      <b-button variant="light"
                size="sm"
                class="custom-action-button"
                @click="callContact">
        <q-tooltip anchor="top middle"
                   self="center middle">
          Call
        </q-tooltip>
        <call-icon></call-icon>
      </b-button>
      <b-button variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="contact.is_dnc"
                @click="openAppointmentModal">
        <q-tooltip anchor="top middle"
                   self="center middle">
          Add appointment
        </q-tooltip>
        <calendar-icon></calendar-icon>
      </b-button>
      <b-button variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="contact.is_dnc"
                @click="openAddReminderModal">
        <q-tooltip anchor="top middle"
                   self="center middle">
          Add reminder
        </q-tooltip>
        <timer-icon></timer-icon>
      </b-button>
      <b-button v-if="!contact.is_dnc"
                variant="light"
                size="sm"
                class="custom-action-button"
                @click="openEnrollSequenceModal">
        <q-tooltip anchor="top middle"
                   self="center middle">
          Enroll to sequence
        </q-tooltip>
        <add-sequence-icon></add-sequence-icon>
      </b-button>
      <b-button variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="true">
        <q-tooltip anchor="top middle"
                   self="center middle">
          Add to power dialer
        </q-tooltip>
        <add-call-icon></add-call-icon>
      </b-button>
    </div>
    <appointment-form-modal :contact="contact"></appointment-form-modal>
    <contact-add-reminder-modal></contact-add-reminder-modal>
    <enroll-sequence-modal></enroll-sequence-modal>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactNameForm from 'src/components/forms/contact-name-form'
import Avatar from 'src/components/avatar.vue'
import AddSequenceIcon from 'src/components/icons/add-sequence-icon'
import TimerIcon from 'src/components/icons/timer-icon'
import CalendarIcon from 'src/components/icons/calendar-icon'
import CallIcon from 'src/components/icons/call-icon'
import AddCallIcon from 'src/components/icons/add-call-icon'
import PencilOIcon from 'src/components/icons/pencil-o-icon'
import AppointmentFormModal from 'src/components/appointments/appointment-form-modal'
import EnrollSequenceModal from 'src/components/enroll-sequence-modal'
import ContactAddReminderModal from 'src/components/contacts/contact-add-reminder-modal'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-info',

  mixins: [aclMixin],

  components: {
    ContactAddReminderModal,
    EnrollSequenceModal,
    AppointmentFormModal,
    PencilOIcon,
    AddCallIcon,
    CallIcon,
    CalendarIcon,
    TimerIcon,
    AddSequenceIcon,
    Avatar,
    ContactNameForm
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'isContactNameEditOpen', 'contactPhoneNumbers', 'changingSelectedContact']),

    contactName () {
      if (this.contact) {
        return this.contact.name || 'No Name'
      }

      return 'No Name'
    },

    phone () {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === this.contact.phone_number)
    }
  },

  data () {
    return {
      showEditForm: false,
      showEnrollSequenceForm: false
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactNameEditOpen', 'addAppointmentOpen', 'enrollSequenceOpen', 'addReminderOpen']),

    openAddReminderModal () {
      this.addReminderOpen(true)
    },

    openEnrollSequenceModal () {
      this.enrollSequenceOpen(true)
    },

    openAppointmentModal () {
      this.addAppointmentOpen(true)
    },

    onCloseEditForm () {
      this.showEditForm = false
    },

    copyPhoneNumber () {
      let phoneNumberClone = document.querySelector('#phone-number-clone')
      phoneNumberClone.setAttribute('type', 'text')
      phoneNumberClone.select()

      try {
        document.execCommand('copy')
        this.$q.notify({
          message: 'Phone number copied to clipboard.',
          type: 'positive',
          textColor: 'white',
          position: 'bottom-right'
        })
      } catch (err) {
        this.$q.notify({
          message: 'Error copying phone number to clipboard.',
          type: 'negative',
          textColor: 'white',
          position: 'bottom-right'
        })
      }

      /* unselect the range */
      phoneNumberClone.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges()
    },

    getPhoneObject () {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === this.contact.phone_number)
    },

    callContact () {
      let data = {
        currentNumber: this.contact.phone_number,
        contactName: this.contact.name,
        companyName: this.contact.company_name,
        contactId: this.contact.id,
        contactTimezone: this.contact.timezone
      }
      this.$VueEvent.fire('callContact', data)
    }
  }
}
</script>
