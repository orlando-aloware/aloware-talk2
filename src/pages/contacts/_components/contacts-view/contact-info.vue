<template>
  <b-card class="mt-2 mb-2 border-0">
    <b-media>
      <template #aside>
        <avatar class="mr-2 contact-avatar"
                width="40"
                height="40"
                :name="contact.name" />
      </template>

      <div class="d-flex justify-content-between relative-position">
        <div>
          <h6 class="mt-0 contact-name" v-b-tooltip="contact.name">{{ contact.name }}</h6>
          <p class="contact-phone">
            {{ contact.phone_number | fixPhone }}
            <b-link href="#" class="copy-phone-number" @click.prevent="copyPhoneNumber"><i class="material-icons">content_copy</i></b-link>
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
      <b-button variant="secondary" size="sm" class="custom-action-button">
        <calendar-icon></calendar-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button">
        <timer-icon></timer-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button">
        <add-sequence-icon></add-sequence-icon>
      </b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button">
        <add-call-icon></add-call-icon>
      </b-button>
    </div>
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

export default {
  name: 'contact-info',
  components: { PencilOIcon, AddCallIcon, CallIcon, CalendarIcon, TimerIcon, AddSequenceIcon, Avatar, ContactNameForm },
  computed: {
    ...mapGetters('contacts', ['contact', 'isContactNameEditOpen'])
  },
  data () {
    return {
      showEditForm: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactNameEditOpen']),
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
          actions: [
            {
              icon: 'close'
            }
          ]
        })
      } catch (err) {
        this.$q.notify({
          message: 'Error copying phone number to clipboard.',
          type: 'negative',
          textColor: 'white',
          actions: [
            {
              icon: 'close'
            }
          ]
        })
      }

      /* unselect the range */
      phoneNumberClone.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges()
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
    right: 0;
    top: 5px;
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
</style>
