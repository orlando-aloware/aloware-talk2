<template>
  <div>
    <b-card class="border-0">
      <h4>All Numbers</h4>
      <contact-phones-list-items :phones="primaryPhone"
                                 @edit="onEditPhone"
                                 @delete="onDeletePhone"
                                 @composerMedia="setComposerVariables">
      </contact-phones-list-items>

      <contact-phones-list-items :phones="otherPhones"
                                 @edit="onEditPhone"
                                 @delete="onDeletePhone"
                                 @composerMedia="setComposerVariables">
      </contact-phones-list-items>

      <b-link ref="phone_form"
              href="#"
              class="custom-link text-decoration-none"
              @click="onAddPhone">
        <plus-circle-icon></plus-circle-icon>
        Add Phone Number
      </b-link>

      <q-menu content-class="mx-height-300"
              ref="templatesMenu"
              no-parent-event
              no-focus
              :offset="[284, -105]"
              v-model="showPhonesForm">
        <div class="row no-wrap q-pa-md">
          <contact-phones-form :phone="phone" @close="onClosePhoneForm"></contact-phones-form>
        </div>
      </q-menu>
    </b-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import ContactPhonesForm from 'src/components/forms/contact-phones-form'
import PlusCircleIcon from 'components/icons/plus-circle-icon'
import ContactPhonesListItems from 'src/components/contacts/contact-phones-list-items'
import { LRN_TYPE_LANDLINE, LRN_TYPE_OTHER, LRN_TYPE_VOIP, LRN_TYPE_WIRELESS } from 'src/constants/lrn-types'

export default {
  name: 'contact-phones',

  mixins: [aclMixin],

  components: {
    ContactPhonesListItems,
    PlusCircleIcon,
    ContactPhonesForm
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactPhoneNumbers']),
    otherPhones () {
      return this.contactPhoneNumbers.filter(phone => phone.phone_number !== this.contact.phone_number)
    },
    primaryPhone () {
      return this.contact.phone_number === '0' ? [] : this.contactPhoneNumbers.filter(phone => phone.phone_number === this.contact.phone_number)
    }
  },

  data () {
    return {
      showPhonesForm: false,
      LRN_TYPE_LANDLINE,
      LRN_TYPE_WIRELESS,
      LRN_TYPE_VOIP,
      LRN_TYPE_OTHER,
      phone: {
        id: null,
        title: '',
        number: '',
        isPrimary: false
      }
    }
  },

  mounted () {
    console.log('phone mounted')
    if (this.contact && this.contact.id) {
      this.getPhoneNumbers()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactPhoneNumbers', 'setContactSelectedPhone', 'setMessageComposerMode', 'setMessageComposerSmsPhoneNumber']),
    getPhoneNumbers () {
      console.trace()
      return talk2Api.V1.contact.getPhoneNumbers(this.contact.id).then(response => {
        this.setContactPhoneNumbers(response.data)
      })
    },

    onAddPhone () {
      this.setContactSelectedPhone(null)
      this.phone = {
        id: null,
        title: '',
        number: '',
        isPrimary: 0
      }
      this.showPhonesForm = true
    },

    onEditPhone (phone) {
      this.setContactSelectedPhone(phone)
      this.phone = {
        id: phone.id,
        title: phone.title,
        number: phone.phone_number,
        isPrimary: phone.phone_number === this.contact.phone_number || false
      }
      this.showPhonesForm = true
    },

    onClosePhoneForm () {
      this.showPhonesForm = false
    },

    onDeletePhone (phone) {
      this.$bvModal.msgBoxConfirm('Do you wish to delete this phone number?', {
        buttonSize: 'sm',
        okTitle: 'Yes, delete',
        cancelTitle: 'No, keep'
      }).then(confirm => {
        if (confirm) {
          this.isDeleting = true
          talk2Api.V1.contact.deletePhone(this.contact.id, phone.id)
            .then(response => {
              this.$generalNotification('Phone number has been deleted.')
              this.getPhoneNumbers()
            }).catch(error => {
              console.log(error)
              this.$generalNotification('Error while deleting phone number.', 'error')
            }).finally(() => {
              this.isDeleting = false
            })
        }
      })
    },

    setComposerVariables (mode, phone) {
      this.setMessageComposerMode(mode)
      this.setMessageComposerSmsPhoneNumber(phone.phone_number)
    }
  },

  watch: {
    'contact.id': function () {
      if (this.contact && this.contact.id) {
        this.getPhoneNumbers()
      }
    }
  }
}
</script>
