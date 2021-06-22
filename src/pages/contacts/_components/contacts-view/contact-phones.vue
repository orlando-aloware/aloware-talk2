<template>
  <div>
    <b-card class="mt-2 mb-2 border-0" id="card-contact-phone">
      <h6>Other Numbers</h6>
      <div class="phone-number-wrapper"
           v-for="phone_number in contact_phone_numbers"
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
                      variant="light">
              <i class="material-icons">edit</i>
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
      <b-link id="btn-add-contact-phone"
              href="#" class="custom-link text-decoration-none">
        <i class="material-icons">add</i> Add Phone Number
      </b-link>
    </b-card>
    <add-phone-popover target="btn-add-contact-phone" triggers="focus"></add-phone-popover>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import contactApi from '../../contacts.api'
import AddPhonePopover from 'pages/contacts/_components/popover/contact/add-phone-popover'
export default {
  name: 'contact-phones',
  components: { AddPhonePopover },
  computed: {
    ...mapGetters('contacts', ['contact', 'contact_phone_numbers'])
  },
  data () {
    return {
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactPhoneNumbers']),
    getPhoneNumbers () {
      return contactApi.getPhoneNumbers(this.contact.id).then(response => {
        this.setContactPhoneNumbers(response.data)
      })
    }
  },
  watch: {
    contact: function () {
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
</style>
