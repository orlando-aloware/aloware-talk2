<template>
  <div>
    <b-card class="mt-2 mb-2 border-0" id="card-contact-phone">
      <h6>All Numbers</h6>
      <div class="phone-number-wrapper"
           v-for="phoneNumber in primaryPhone"
           :key="phoneNumber.id">
        <div>
          <span v-if="phoneNumber.title" class="text-muted phone-number-title mr-2">{{ phoneNumber.title }} </span>
          <b-badge v-if="phoneNumber && $options.filters.validLrnType(phoneNumber.lrn_type)"
                   :variant="getBadgeVariant(phoneNumber.lrn_type)"
                   class="badge-phone-info mr-1">
            {{ phoneNumber.lrn_type | fixLrnType }}
          </b-badge>

          <b-badge v-if="phoneNumber.phone_number === contact.phone_number"
                   variant="grey-80"
                   class="badge-phone-info">
            Primary
          </b-badge>
        </div>
        <div class="d-flex justify-content-between">
          <p class="phone-number m-0">
            {{ phoneNumber.phone_number | fixPhone }}
          </p>
          <div class="options phone-options p-0">
            <b-button class="btn-bg-transparent btn-b-0"
                      size="sm"
                      variant="light" v-on:click="onEditPhone(phoneNumber)">
              <pencil-o-icon color="#256EFF"></pencil-o-icon>
            </b-button>

            <b-dropdown no-caret
                        variant="light"
                        class="m-md-2 bg-transparent b-0"
                        size="sm"
                        offset="-125">
              <template slot="button-content">
                <i class="material-icons">more_vert</i>
              </template>
              <b-dropdown-item class="phone-actions" @click="setComposerVariables('sms', phoneNumber)">
                <i class="material-icons">description</i> Text
              </b-dropdown-item>
              <b-dropdown-item class="phone-actions"><i class="material-icons">phone</i> Call</b-dropdown-item>
              <b-dropdown-item class="phone-actions" @click="setComposerVariables('fax', phoneNumber)">
                <i class="material-icons">print</i> Fax
              </b-dropdown-item>
              <b-dropdown-item v-if="phoneNumber.phone_number !== contact.phone_number" class="phone-actions" @click="onDeletePhone(phoneNumber)">
                <i class="material-icons">delete</i> Delete
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <div class="phone-number-wrapper"
           v-for="phoneNumber in otherPhones"
           :key="phoneNumber.id">
        <div>
          <span v-if="phoneNumber.title" class="text-muted phone-number-title mr-1">{{ phoneNumber.title }} </span>
          <b-badge v-if="phoneNumber.lrn_type && $options.filters.validLrnType(phoneNumber.lrn_type)"
                   :variant="getBadgeVariant(phoneNumber.lrn_type)"
                   class="badge-phone-info">
            {{ phoneNumber.lrn_type | fixLrnType }}
          </b-badge>
        </div>
        <div class="d-flex justify-content-between">
          <p class="phone-number m-0">
            {{ phoneNumber.phone_number | fixPhone }}
          </p>
          <div class="options phone-options p-0">
            <b-button class="btn-bg-transparent btn-b-0"
                      size="sm"
                      variant="light" v-on:click="onEditPhone(phoneNumber)">
              <pencil-o-icon color="#256EFF"></pencil-o-icon>
            </b-button>

            <b-dropdown no-caret
                        variant="light"
                        class="m-md-2 bg-transparent b-0"
                        size="sm"
                        offset="-125">
              <template slot="button-content">
                <i class="material-icons">more_vert</i>
              </template>
              <b-dropdown-item class="phone-actions" @click="setComposerVariables('sms', phoneNumber)">
                <i class="material-icons">description</i> Text
              </b-dropdown-item>
              <b-dropdown-item class="phone-actions"><i class="material-icons">phone</i> Call</b-dropdown-item>
              <b-dropdown-item class="phone-actions" @click="setComposerVariables('fax', phoneNumber)">
                <i class="material-icons">print</i> Fax
              </b-dropdown-item>
              <b-dropdown-item v-if="phoneNumber.phone_number !== contact.phone_number" class="phone-actions" @click="onDeletePhone(phoneNumber)">
                <i class="material-icons">delete</i> Delete
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <b-link id="btn-show-phone-form"
              ref="phone_form"
              href="#" class="custom-link text-decoration-none">
        <plus-circle-icon></plus-circle-icon> Add Phone Number
      </b-link>
    </b-card>
    <b-popover custom-class="contact-phone-popover"
               id="contact-phone-form-popover"
               target="btn-show-phone-form"
               triggers="click"
               :show.sync="showPhonesForm"
               @hidden="onPopoverHidden">
      <contact-phones-form @close="onClosePhoneForm"></contact-phones-form>
    </b-popover>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import ContactPhonesForm from 'pages/contacts/_components/forms/contact-phones-form'
import PencilOIcon from 'components/icons/pencil-o-icon'
import PlusCircleIcon from 'components/icons/plus-circle-icon'
import { LRN_TYPE_LANDLINE, LRN_TYPE_OTHER, LRN_TYPE_VOIP, LRN_TYPE_WIRELESS } from 'src/constants/lrn-types'

export default {
  name: 'contact-phones',
  components: { PlusCircleIcon, PencilOIcon, ContactPhonesForm },
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
      LRN_TYPE_OTHER
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactPhoneNumbers', 'setContactSelectedPhone', 'setMessageComposerMode', 'setMessageComposerSmsPhoneNumber']),
    getPhoneNumbers () {
      return talk2Api.V1.contact.getPhoneNumbers(this.contact.id).then(response => {
        this.setContactPhoneNumbers(response.data)
      })
    },
    onEditPhone (phoneNumber) {
      this.setContactSelectedPhone(phoneNumber)
      this.$root.$emit('bv::show::popover', 'contact-phone-form-popover')
    },
    onClosePhoneForm () {
      this.showPhonesForm = false
    },
    onPopoverHidden () {
      this.setContactSelectedPhone(null)
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
              this.$q.notify({
                message: 'Phone number has been deleted.',
                type: 'positive',
                textColor: 'white',
                position: 'bottom-right'
              })
              this.getPhoneNumbers()
            }).catch(error => {
              console.log(error)
              this.$q.notify({
                message: 'Error while deleting phone number.',
                type: 'negative',
                textColor: 'white',
                position: 'bottom-right'
              })
            }).finally(() => {
              this.isDeleting = false
            })
        }
      })
    },
    setComposerVariables (mode, phone) {
      this.setMessageComposerMode(mode)
      this.setMessageComposerSmsPhoneNumber(phone.phone_number)
    },
    getBadgeVariant (lrnType) {
      switch (lrnType) {
        case LRN_TYPE_LANDLINE:
          return 'yellow-1'
        case LRN_TYPE_WIRELESS:
          return 'blue-3'
        case LRN_TYPE_VOIP:
          return 'purple-2'
        case LRN_TYPE_OTHER:
          return 'green-3'
      }
    }
  },
  watch: {
    'contact.id': function () {
      this.getPhoneNumbers()
    }
  },
  mounted () {
    this.getPhoneNumbers()
  }
}
</script>

<style lang="scss" scoped>
  .phone-number {
    font-size: 14px;
  }

  .phone-number-title {
    font-size: 12px;
    font-weight: normal;
    color: #FFFFFF;
    display: inline-block;
    top: 0;
    position: relative;
  }

  .phone-number-wrapper:hover {
    div.options {
      opacity: 1;
    }
  }

  div.options {
    margin-top: -14px;
    opacity: 0;
  }

  .phone-actions{
    font-size: 80%;

    i {
      margin-top: -3px;
    }
  }

  .contact-phone-popover {
    left: -340px !important;
    width: 300px;
  }
</style>
