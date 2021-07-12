<template>
  <b-card class="mt-2 mb-2 border-0" id="card-contact-info">
    <b-media>
      <template #aside>
        <q-item-section avatar>
          <avatar class="contact-avatar"
                  width="40"
                  height="40"
                  :name="contact.name" />
        </q-item-section>

      </template>

      <div class="d-flex justify-content-between relative-position">
        <div>

          <h6 class="mt-0 contact-name" v-b-tooltip="contact.name">{{ contact.name }}</h6>
          <p class="contact-phone">
            {{ contact.phone_number | fixPhone }}
            <b-badge v-if="phone && phone.lrn_type !== 'undefined'" variant="warning" class="badge-phone-info">{{ phone.lrn_type }}</b-badge>
            <b-link href="#" class="copy-phone-number ml-1" @click.prevent="copyPhoneNumber"><i class="material-icons">content_copy</i></b-link>
            <input type="hidden" id="phone-number-clone" :value="contact.phone_number">
          </p>
        </div>
        <b-button class="btn-edit-contact-info btn-bg-transparent btn-b-0"
                  size="sm"
                  variant="light"
                  id="btn-edit-contact-info">
          <pencil-o-icon></pencil-o-icon>
        </b-button>
        <b-popover custom-class="edit-form-popover"
                   target="btn-edit-contact-info"
                   triggers="focus"
                   :show.sync="showEditForm">
            <contact-name-form @close="onCloseEditForm"></contact-name-form>
        </b-popover>
      </div>
    </b-media>
    <div class="d-inline-flex flex-wrap contact-action-button">
      <b-button variant="secondary" size="sm" class="custom-action-button">
        <call-icon></call-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button" @click="openAppointmentModal">
        <calendar-icon></calendar-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button" @click="openAddReminderModal">
        <timer-icon></timer-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"  @click="openEnrollSequenceModal">
        <add-sequence-icon></add-sequence-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button">
        <add-call-icon></add-call-icon>
      </b-button>
    </div>
    <appointment-form-modal :contact="contact"></appointment-form-modal>
    <enroll-sequence-modal></enroll-sequence-modal>
    <contact-add-reminder-modal></contact-add-reminder-modal>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactNameForm from 'pages/contacts/_components/forms/contact-name-form'
import Avatar from 'src/components/avatar/avatar.vue'
import AddSequenceIcon from 'components/icons/add-sequence-icon'
import TimerIcon from 'components/icons/timer-icon'
import CalendarIcon from 'components/icons/calendar-icon'
import CallIcon from 'components/icons/call-icon'
import AddCallIcon from 'components/icons/add-call-icon'
import PencilOIcon from 'components/icons/pencil-o-icon'
import AppointmentFormModal from 'pages/contacts/_components/appointments/appointment-form-modal'
import EnrollSequenceModal from 'pages/contacts/_components/enroll-sequence-modal'
import ContactAddReminderModal from 'pages/contacts/_components/contact-add-reminder-modal'

export default {
  name: 'contact-info',
  components: { ContactAddReminderModal, EnrollSequenceModal, AppointmentFormModal, PencilOIcon, AddCallIcon, CallIcon, CalendarIcon, TimerIcon, AddSequenceIcon, Avatar, ContactNameForm },
  computed: {
    ...mapGetters('contacts', ['contact', 'isContactNameEditOpen', 'contactPhoneNumbers', 'changingSelectedContact']),
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
    onCloseAddReminderPopover () {
      this.$root.$emit('bv::hide::popover', 'add-reminder-popover')
    },
    onCloseSequenceEnrollPopover () {
      this.showEnrollSequenceForm = false
      this.$root.$emit('bv::hide::popover', 'enroll-sequence-popover')
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-name{
    font-size: 0.85em;
    display: inline-block;
    width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .contact-avatar {
    background-color: #95989E !important;
  }

  .q-item__section--avatar {
    padding-right: 0 !important;
    min-width: 0 !important;
  }

  .card:hover {
    .btn-edit-contact-info {
      opacity: 1;
    }
  }

  .contact-phone {
    font-size: 0.80rem;
    margin-top: -5px;
    right: 0;

    .copy-phone-number {
      text-decoration: none;
      color: #62666E;
    }
  }

  .btn-edit-contact-info {
    position: absolute;
    right: -7px;
    top: -9px;
    opacity: 0;
  }

  .contact-action-button {
    button {
      margin-right: 10px;
    }

    .custom-action-button {
      background: #F4F4F6;
      color: #62666E;
      border: none;
    }
  }

  .edit-form-popover{
    left: -251px !important;
    width: 300px;
  }

  .enroll-sequence-popover{
    left: -341px !important;
    width: 300px;
  }

  .add-reminder-popover {
    left: -341px !important;
    width: 300px;
  }
</style>
