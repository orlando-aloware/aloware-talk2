<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Other Numbers</h6>
    <div v-for="phone_number in phone_numbers" :key="phone_number.id">
      <div>
        <small class="text-muted">{{ phone_number.title }}</small>
      </div>
      <div class="d-flex justify-content-between">
        <p class="phone-number m-0">
          {{ phone_number.phone_number | fixPhone }}
        </p>
        <div class="options p-0">
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
            <b-dropdown-item><i class="material-icons">description</i> Text</b-dropdown-item>
            <b-dropdown-item><i class="material-icons">phone</i> Call</b-dropdown-item>
            <b-dropdown-item><i class="material-icons">print</i> Fax</b-dropdown-item>
            <b-dropdown-item><i class="material-icons">delete</i> Delete</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
    <b-button v-if="phone_numbers.length < 1"
              variant="light"
              size="sm"
              class="custom-action-button">
      <i class="material-icons">add</i> Add Phone Number
    </b-button>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import contactApi from '../../contacts.api'
export default {
  name: 'contact-phones',
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      phone_numbers: []
    }
  },
  methods: {
    getPhoneNumbers () {
      return contactApi.getPhoneNumbers(this.contact.id).then(response => {
        this.phone_numbers = response.data
      })
    }
  },
  watch: {
    contact: function () {

    }
  }
}
</script>

<style lang="scss" scoped>
  .phone-number {
    font-size: 0.90rem;
  }

  div.options {
    margin-top: -14px;
  }
</style>
