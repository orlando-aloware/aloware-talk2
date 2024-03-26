<template>
  <div class="w-100"
       v-if="contact">
    <b-card class="border-0 w-100"
            data-testid="contact-phones-card"
            no-body>
      <b-card-body :class="bodyClass" data-testid="contact-phones-body">
        <div class="w-100">
          <h4>All Numbers</h4>
          <contact-phones-list-items :phones="primaryPhone"
                                     data-testid="contact-phones-list-items-primary"
                                     @edit="onEditPhone"
                                     @delete="onDeletePhone"
                                     @composerMedia="setComposerVariables"
                                     @call="onCall">
          </contact-phones-list-items>

          <contact-phones-list-items :phones="otherPhones"
                                     data-testid="contact-phones-list-items-other"
                                     @edit="onEditPhone"
                                     @delete="onDeletePhone"
                                     @composerMedia="setComposerVariables"
                                     @call="onCall">
          </contact-phones-list-items>

          <b-link ref="phone_form"
                  href="#"
                  class="custom-link text-decoration-none"
                  data-testid="contact-phones-add-phone-button"
                  @click="onAddPhone">
            <plus-circle-icon />
            Add Phone Number
          </b-link>

          <q-menu content-class="mx-height-300"
                  ref="templatesMenu"
                  no-parent-event
                  no-focus
                  :offset="[284, -105]"
                  data-testid="contact-phones-form-menu"
                  v-model="showPhonesForm">
            <div class="row no-wrap q-pa-md">
              <contact-phones-form :phone="phone"
                                   data-testid="contact-phones-form"
                                   @close="onClosePhoneForm">
              </contact-phones-form>
            </div>
          </q-menu>
        </div>
      </b-card-body>
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
import _ from 'lodash'

export default {
  name: 'contact-phones',

  mixins: [aclMixin],

  props: {
    noBottomPadding: {
      type: Boolean,
      default: false
    }
  },

  components: {
    ContactPhonesListItems,
    PlusCircleIcon,
    ContactPhonesForm
  },

  computed: {
    ...mapGetters('contacts', [
      'contact',
      'contactPhoneNumbers'
    ]),

    otherPhones () {
      return this.contactPhoneNumbers.filter(phone => phone.phone_number !== this.contact.phone_number)
    },

    primaryPhone () {
      return this.contact.phone_number === '0'
        ? []
        : this.contactPhoneNumbers.filter(phone => phone.phone_number === this.contact.phone_number)
    },

    bodyClass () {
      const paddingClass = this.noBottomPadding ? 'pb-0' : ''

      return [
        paddingClass
      ]
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
        isPrimary: false,
        isOptedOut: false
      }
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setContactSelectedPhone',
      'setMessageComposerMode',
      'setMessageComposerSmsPhoneNumber',
      'removeContactPhoneNumber'
    ]),

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
        isPrimary: phone.phone_number === this.contact.phone_number || false,
        isOptedOut: phone.is_opted_out
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
              this.removeContactPhoneNumber(phone)
              this.$generalNotification('Phone number has been deleted.')
            }).catch(error => {
              console.log(error)
              this.$handleErrors(error.response)
            }).finally(() => {
              this.isDeleting = false
            })
        }
      })
    },

    onCall (phone) {
      const data = {
        currentNumber: phone.phone_number,
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

    setComposerVariables (mode, phone) {
      this.setMessageComposerMode(mode)
      this.setMessageComposerSmsPhoneNumber(phone.phone_number)
    }
  },

  watch: {
    'contact.id': _.debounce(function () {
      const contactId = this.contact?.id

      if (contactId && this.$route.params.id === contactId.toString()) {
        talk2Api.V1.contact.getPhoneNumbers()
          .catch(err => {
            console.log(err)
            this.$handleErrors(err.response)
          })
      }
    }, 500)
  }
}
</script>
