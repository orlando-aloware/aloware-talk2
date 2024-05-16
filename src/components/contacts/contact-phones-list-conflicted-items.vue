<template>
  <div>
    <div class="phone-number-wrapper"
         data-testid="contact-phones-list-conflicted-items-wrapper"
         v-for="phone in phones"
         :key="phone.id">
      <div>
        <span class="text-muted phone-number-title mr-1"
              v-if="phone.title">
          {{ phone.title }}
        </span>

        <b-badge class="badge-phone-info mr-1"
                 :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
                 data-testid="contact-phones-list-conflicted-items-lrn-badge"
                 v-if="(phone.lrn_type || phone.lrn_type === 0) && $options.filters.validLrnType(phone.lrn_type)">
          {{ phone.lrn_type | fixLrnType }}
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 data-testid="contact-phones-list-conflicted-items-invalid-number-badge"
                 v-if="phone.is_invalid">
          Invalid Number
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 data-testid="contact-phones-list-conflicted-items-opt-out-badge"
                 v-if="phone.is_opted_out">
          Opt-Out
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 data-testid="contact-phones-list-conflicted-items-has-conflict">
          Conflicted
        </b-badge>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div class="phone-number m-0">
          {{ phone.phone_number | fixPhone }}
        </div>
        <div class="phone-number-duplicates-icon">
          <contact-phone-number-duplicates
            :phone_number="phone" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContactPhoneNumberDuplicates from 'components/contacts/contact-phone-number-duplicates'

export default {
  name: 'contact-phones-list-conflicted-items',

  components: {
    ContactPhoneNumberDuplicates
  },

  props: {
    phones: {
      type: Array,
      required: true
    }
  }
}
</script>
