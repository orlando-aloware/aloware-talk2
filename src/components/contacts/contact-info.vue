<template>
    <b-card class="border-0 contact-info-wrapper">
        <b-media class="min-w-0">
            <template #aside>
                <q-item-section avatar>
                    <avatar class="contact-avatar"
                            width="40"
                            height="40"
                            :name="contact.name">
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

              <b-link href="#"
                      class="copy-phone-number ml-1"
                      @click.prevent="copyPhoneNumber(contact.phone_number)">
                <q-tooltip anchor="top middle"
                           self="center middle">
                  Copy
                </q-tooltip>
                <i class="material-icons">content_copy</i>
              </b-link>

              <br/>

              <b-badge class="badge-phone-info mr-1"
                       :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
                       v-if="phone && $options.filters.validLrnType(phone.lrn_type)">
                {{ phone.lrn_type | fixLrnType }}
              </b-badge>

               <b-badge variant="danger"
                        class="badge-phone-info mr-1"
                        v-if="phone && phone.is_invalid">
                Invalid Number
              </b-badge>

               <b-badge variant="danger"
                        class="badge-phone-info mr-1"
                        v-if="contact.is_dnc">
                DNC
              </b-badge>
            </span>
                        <span v-else>
              Phone number unavailable
            </span>
                    </p>
                    <div class="flex mb-4">
            <span class="material-icons">
                schedule
            </span>
                        <digital-clock class="ml-2"
                                       :timezone="contact.timezone">
                        </digital-clock>
                    </div>
                </div>
                <b-button class="btn-edit-contact-info btn-bg-transparent btn-b-0"
                          size="sm"
                          variant="light"
                          @click="onOpenEditForm">
                    <pencil-o-icon/>
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
                      class="custom-action-button my-1"
                      @click="callContact">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Call
                </q-tooltip>
                <call-icon/>
            </b-button>

            <b-button variant="light"
                      size="sm"
                      class="custom-action-button my-1"
                      :disabled="isProcessingBlock"
                      v-if="hasPermissionTo('toggle block contact') && !contact.is_blocked"
                      @click="blockContact">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Block
                </q-tooltip>
                <i class="fa fa-lock"
                   v-if="!isProcessingBlock">
                </i>
                <q-spinner-bars class="mr-1"
                                color="blue"
                                v-if="isProcessingBlock"/>
            </b-button>

            <b-button variant="light"
                      size="sm"
                      class="custom-action-button my-1"
                      :disabled="isProcessingBlock"
                      v-if="hasPermissionTo('toggle block contact') && contact.is_blocked"
                      @click="unBlockContact">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Unblock
                </q-tooltip>
                <q-spinner-bars class="mr-1"
                                color="blue"
                                v-if="isProcessingBlock"/>
                <i class="fa fa-lock-open"
                   v-if="!isProcessingBlock">
                </i>
            </b-button>

            <contact-dnc-actions class="mr-2 my-1"
                                 :contact="contact"></contact-dnc-actions>

            <b-button variant="light"
                      size="sm"
                      class="custom-action-button my-1"
                      :disabled="contact.is_dnc"
                      @click="addAppointmentOpen(true)">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Add appointment
                </q-tooltip>
                <calendar-icon/>
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
                <timer-icon></timer-icon>
            </b-button>
            <b-button variant="light"
                      size="sm"
                      class="custom-action-button my-1"
                      @click="openPowerDialerModal">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Add to power dialer
                </q-tooltip>
                <add-call-icon/>
            </b-button>
            <b-button variant="light"
                      size="sm"
                      class="custom-action-button my-1"
                      :disabled="!isSimpSocialIntegrationEnabled"
                      v-if="isSimpsocial"
                      @click="openEmailBlast">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Email
                </q-tooltip>
                <email-icon width="16"/>
            </b-button>
            <b-button variant="light"
                      size="sm"
                      class="custom-action-button my-1"
                      :disabled="isVideoConferenceLinkSending"
                      v-if="isSimpsocial"
                      @click="openVideoConference">
                <q-tooltip anchor="bottom middle"
                           self="center middle">
                    Video Conference
                </q-tooltip>
                <video-conference-icon width="16"/>
            </b-button>
        </div>
        <appointment-form-modal :contact="contact"></appointment-form-modal>
        <contact-add-reminder-modal></contact-add-reminder-modal>
        <power-dialer-add-modal :params="addPowerDialerParams"
                                :redirect="false">
        </power-dialer-add-modal>
    </b-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ContactNameForm from 'src/components/forms/contact-name-form'
import Avatar from 'src/components/avatar'
import TimerIcon from 'src/components/icons/timer-icon'
import CalendarIcon from 'src/components/icons/calendar-icon'
import CallIcon from 'src/components/icons/call-icon'
import AddCallIcon from 'src/components/icons/add-call-icon'
import PencilOIcon from 'src/components/icons/pencil-o-icon'
import AppointmentFormModal from 'src/components/appointments/appointment-form-modal'
import ContactAddReminderModal from 'src/components/contacts/contact-add-reminder-modal'
import PowerDialerAddModal from 'src/components/power-dialer/power-dialer-add-modal.vue'
import { aclMixin, simpsocialMixin, timezoneCheckMixin } from 'src/plugins/mixins'
import DigitalClock from 'components/digital-clock'
import talk2Api from 'src/plugins/api/api'
import ContactDncActions from 'components/contacts/contact-dnc-actions'
import EmailIcon from 'components/icons/email-icon'
import VideoConferenceIcon from 'components/icons/video-conference-icon'

export default {
  name: 'contact-info',

  props: {
    campaignId: {
      required: true
    }
  },

  mixins: [
    aclMixin,
    simpsocialMixin,
    timezoneCheckMixin
  ],

  components: {
    VideoConferenceIcon,
    EmailIcon,
    ContactDncActions,
    DigitalClock,
    ContactAddReminderModal,
    AppointmentFormModal,
    PowerDialerAddModal,
    PencilOIcon,
    AddCallIcon,
    CallIcon,
    CalendarIcon,
    TimerIcon,
    Avatar,
    ContactNameForm
  },

  computed: {
    ...mapState(['isMobile']),

    ...mapState('cache', ['currentCompany']),

    ...mapGetters('contacts', [
      'contact',
      'isContactNameEditOpen',
      'contactPhoneNumbers',
      'changingSelectedContact'
    ]),

    contactName () {
      if (this.contact) {
        return this.contact.name || 'No Name'
      }

      return 'No Name'
    },

    phone () {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === this.contact.phone_number)
    },

    addPowerDialerParams () {
      return {
        contact_ids: [this.contact.id]
      }
    }
  },

  data () {
    return {
      showEditForm: false,
      isProcessingDNC: false,
      isProcessingBlock: false,
      isVideoConferenceLinkSending: false
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setContactNameEditOpen',
      'addAppointmentOpen',
      'addReminderOpen',
      'addPowerDialerOpen'
    ]),

    ...mapActions(['setShowPhone']),

    openPowerDialerModal () {
      this.addPowerDialerOpen(true)
    },

    openEmailBlast () {
      this.$router.push({
        name: 'Email Blast',
        params: {
          id: this.contact.id
        }
      })
    },

    openVideoConference () {
      if (this.isVideoConferenceLinkSending) {
        return
      }

      this.isVideoConferenceLinkSending = true

      talk2Api.V1.integrations.simpsocial.videoConference.send(this.contact.id, this.campaignId)
        .then(res => {
          this.isVideoConferenceLinkSending = false
        }).catch(err => {
          this.isVideoConferenceLinkSending = false
          this.$handleErrors(err.response)
        })
    },

    onOpenEditForm () {
      this.showEditForm = true
    },

    onCloseEditForm () {
      this.showEditForm = false
    },

    copyPhoneNumber (phoneNumber) {
      this.$copyToClipboard(phoneNumber)
      this.$generalNotification('Phone number copied to clipboard.')
    },

    getPhoneObject () {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === this.contact.phone_number)
    },

    initiateCall () {
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

      this.$VueEvent.fire('callContact', data)
    },

    callContact () {
      let contact = {
        timezone: this.contact.timezone,
        name: this.contact.name
      }

      this.checkContactTimezone(contact, this.initiateCall)
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
