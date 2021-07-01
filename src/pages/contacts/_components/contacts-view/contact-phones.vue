<template>
  <div>
    <b-card class="mt-2 mb-2 border-0" id="card-contact-phone">
      <h6>Other Numbers</h6>
      <div class="phone-number-wrapper"
           v-for="phone_number in otherNumbers"
           :key="phone_number.id">
        <div>
          <small class="text-muted">{{ phone_number.title }}</small>
        </div>
        <div class="d-flex justify-content-between">
          <p class="phone-number m-0">
            {{ phone_number.phone_number | fixPhone }}
          </p>
          <div class="options phone-options p-0">
            <b-button class="btn-bg-transparent btn-b-0"
                      size="sm"
                      variant="light" v-on:click="onEditPhone(phone_number)">
              <pencil-o-icon color="#62666E"></pencil-o-icon>
            </b-button>

            <b-dropdown no-caret
                        variant="light"
                        class="m-md-2 bg-transparent b-0"
                        size="sm"
                        offset="-125">
              <template slot="button-content">
                <i class="material-icons">more_vert</i>
              </template>
              <b-dropdown-item class="phone-actions"><i class="material-icons">description</i> Text</b-dropdown-item>
              <b-dropdown-item class="phone-actions"><i class="material-icons">phone</i> Call</b-dropdown-item>
              <b-dropdown-item class="phone-actions"><i class="material-icons">print</i> Fax</b-dropdown-item>
              <b-dropdown-item class="phone-actions"><i class="material-icons">delete</i> Delete</b-dropdown-item>
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
               triggers="click blur"
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
export default {
  name: 'contact-phones',
  components: { PlusCircleIcon, PencilOIcon, ContactPhonesForm },
  computed: {
    ...mapGetters('contacts', ['contact', 'contact_phone_numbers']),
    otherNumbers () {
      return this.contact_phone_numbers.filter(phone => phone.phone_number !== this.contact.phone_number)
    }
  },
  data () {
    return {
      showPhonesForm: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactPhoneNumbers', 'setContactSelectedPhone']),
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
    font-size: 0.90rem;
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
