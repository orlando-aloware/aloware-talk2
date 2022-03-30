<template>
  <b-card class="border-0 contact-info-wrapper">
    <b-media class="min-w-0">
      <template #aside>
        <q-item-section avatar>
          <avatar :name="contact.name"
                  class="contact-avatar"
                  width="40"
                  height="40">
          </avatar>
        </q-item-section>
      </template>

      <div class="d-flex justify-content-between relative-position w-100">
        <div class="w-100 d-grid">
          <div class="mt-1 mb-0 contact-name-wrapper">
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ contactName }}
            </q-tooltip>
            <h2 class="contact-name pb-1">{{ contactName }}</h2>
          </div>
          <p class="contact-phone">
            <span v-if="contact.phone_number !== '0'">
              <span class="contact-primary-phone">{{ contact.phone_number | fixPhone }}</span>
              <b-badge v-if="phone && $options.filters.validLrnType(phone.lrn_type)"
                       :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
                       class="badge-phone-info ml-1">
                {{ phone.lrn_type | fixLrnType }}
              </b-badge>

               <b-badge v-if="contact.is_dnc"
                        variant="danger"
                        class="badge-phone-info ml-1">
                DNC
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
          <div class="flex mb-4">
            <span class="material-icons">
                schedule
            </span>
            <digital-clock class="ml-2" :timezone="contact.timezone"></digital-clock>
          </div>
        </div>
        <b-button class="btn-edit-contact-info btn-bg-transparent btn-b-0"
                  size="sm"
                  variant="light"
                  @click="onOpenEditForm">
          <pencil-o-icon></pencil-o-icon>
        </b-button>
        <q-menu content-class="mx-height-300"
                no-focus
                no-parent-event
                :offset="[300, -122]"
                v-model="showEditForm">
          <div class="row no-wrap q-pa-md">
            <contact-name-form @close="onCloseEditForm"></contact-name-form>
          </div>
        </q-menu>
      </div>
    </b-media>
    <div class="d-inline-flex flex-wrap contact-action-button">
      <b-button variant="light"
                size="sm"
                class="custom-action-button"
                @click="callContact">
        <q-tooltip anchor="bottom middle"
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
        <q-tooltip anchor="bottom middle"
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
        <q-tooltip anchor="bottom middle"
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
        <q-tooltip anchor="bottom middle"
                   self="center middle">
          Enroll to sequence
        </q-tooltip>
        <add-sequence-icon></add-sequence-icon>
      </b-button>
      <b-button variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="true">
        <q-tooltip anchor="bottom middle"
                   self="center middle">
          Add to power dialer
        </q-tooltip>
        <add-call-icon></add-call-icon>
      </b-button>

      <b-button v-if="hasPermissionTo('toggle block contact') && !contact.is_blocked"
                variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="isProcessingBlock"
                @click="blockContact">
        <q-tooltip anchor="bottom middle"
                   self="center middle">
          Block
        </q-tooltip>
        <i v-if="!isProcessingBlock"
           class="fa fa-lock">
        </i>
        <q-spinner-bars v-if="isProcessingBlock"
                        class="mr-1"
                        color="white" />
      </b-button>

      <b-button v-if="hasPermissionTo('toggle block contact') && contact.is_blocked"
                variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="isProcessingBlock"
                @click="unBlockContact">
        <q-tooltip anchor="bottom middle"
                   self="center middle">
          Unblock
        </q-tooltip>
        <q-spinner-bars v-if="isProcessingBlock"
                        class="mr-1"
                        color="white" />
        <i v-if="!isProcessingBlock"
              class="fa fa-lock-open">
        </i>
      </b-button>

      <b-button v-if="hasPermissionTo('toggle block contact') && !contact.is_dnc"
                variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="isProcessingDNC"
                @click="dncContact">
        <q-tooltip v-if="!contact.is_dnc"
                   anchor="bottom middle"
                   self="center middle">
          DNC
        </q-tooltip>

        <q-spinner-bars v-if="isProcessingDNC"
                        class="mr-1"
                        color="white" />
        <i v-if="!isProcessingDNC"
           class="fa fa-ban">
        </i>
      </b-button>

      <b-button v-if="hasRole('Company Admin') && contact.is_dnc && currentCompany && [CompanyImportance.IMPORTANCE_RESTRICTED, CompanyImportance.IMPORTANCE_C_LEVEL].includes(currentCompany.importance)"
                variant="light"
                size="sm"
                class="custom-action-button"
                :disabled="isProcessingDNC"
                @click="unDncContact">
        <q-tooltip v-if="contact.is_dnc"
                   anchor="bottom middle"
                   self="center middle">
          Un-DNC
        </q-tooltip>

        <q-spinner-bars v-if="isProcessingDNC"
                        class="mr-1"
                        color="white" />
        <i v-if="!isProcessingDNC"
           class="fa fa-ban">
        </i>
      </b-button>
    </div>
    <appointment-form-modal :contact="contact"></appointment-form-modal>
    <contact-add-reminder-modal></contact-add-reminder-modal>
    <enroll-sequence-modal></enroll-sequence-modal>
  </b-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ContactNameForm from 'src/components/forms/contact-name-form'
import Avatar from 'src/components/avatar'
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
import DigitalClock from 'components/digital-clock'
import talk2Api from 'src/plugins/api/api'
import * as CompanyImportance from 'src/constants/importance-label'

export default {
  name: 'contact-info',

  mixins: [aclMixin],

  components: {
    DigitalClock,
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
    ...mapState(['isMobile']),
    ...mapState('cache', ['currentCompany']),
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
      showEnrollSequenceForm: false,
      isProcessingDNC: false,
      isProcessingBlock: false,
      CompanyImportance
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactNameEditOpen', 'addAppointmentOpen', 'enrollSequenceOpen', 'addReminderOpen']),
    ...mapActions(['setShowPhone']),

    openAddReminderModal () {
      this.addReminderOpen(true)
    },

    openEnrollSequenceModal () {
      this.enrollSequenceOpen(true)
    },

    openAppointmentModal () {
      this.addAppointmentOpen(true)
    },

    onOpenEditForm () {
      this.showEditForm = true
    },

    onCloseEditForm () {
      this.showEditForm = false
    },

    copyPhoneNumber () {
      const phoneNumberClone = document.querySelector('#phone-number-clone')
      phoneNumberClone.setAttribute('type', 'text')
      phoneNumberClone.select()

      try {
        document.execCommand('copy')
        this.$generalNotification('Phone number copied to clipboard.')
      } catch (err) {
        this.$generalNotification('Error copying phone number to clipboard.', 'error')
      }

      /* unselect the range */
      phoneNumberClone.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges()
    },

    getPhoneObject () {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === this.contact.phone_number)
    },

    callContact () {
      const data = {
        currentNumber: this.contact.phone_number,
        contactName: this.contact.name,
        companyName: this.contact.company_name,
        contactId: this.contact.id,
        contactTimezone: this.contact.timezone
      }

      if (this.isMobile) {
        this.setShowPhone(true)
        setTimeout(() => {
          this.$VueEvent.fire('changePhoneNumber', data)
        }, 100)
        return
      }
      console.log('data :>> ', data)

      this.$VueEvent.fire('callContact', data)
    },

    dncContact () {
      this.$q.dialog({
        title: '',
        message: 'DNC will disable all communications to a contact and is irreversible. Do you wish to continue?',
        persistent: true,
        ok: {
          label: 'Yes'
        },
        cancel: {
          label: 'No',
          color: 'secondary'
        }
      }).onOk(() => {
        this.isProcessingDNC = true
        talk2Api.V1.contact.update(this.contact.id, { is_dnc: 1 }).then(response => {
          this.contact.is_dnc = true
          this.isProcessingDNC = false
          this.$generalNotification('Contact was successfully DNC.', 'success')
        })
      })
    },

    unDncContact () {
      this.$q.dialog({
        title: 'Un-DNC',
        message: 'Are you sure you want to Un-DNC ' + this.contactName + '?',
        prompt: {
          model: '',
          isValid: val => val.trim().length > 2, // << here is the magic
          type: 'text' // optional
        },
        persistent: true,
        ok: {
          label: 'Yes'
        },
        cancel: {
          label: 'No',
          color: 'secondary'
        }
      }).onOk(data => {
        this.isProcessingDNC = true
        talk2Api.V1.contact.unDnc(this.contact.id, data).then(() => {
          this.contact.is_dnc = false
          this.isProcessingDNC = false
          this.$generalNotification('Contact was successfully un-DNC.', 'success')
        })
      })
    },

    blockContact () {
      this.isProcessingBlock = true
      talk2Api.V1.contact.update(this.contact.id, { is_blocked: 1 }).then(() => {
        this.contact.is_blocked = true
        this.isProcessingBlock = false
        this.$generalNotification('Contact was successfully blocked.', 'success')
      })
    },
    unBlockContact () {
      this.isProcessingBlock = true
      talk2Api.V1.contact.update(this.contact.id, { is_blocked: 0 }).then(() => {
        this.contact.is_blocked = false
        this.isProcessingBlock = false
        this.$generalNotification('Contact was successfully unblocked.', 'success')
      })
    }
  }
}
</script>
