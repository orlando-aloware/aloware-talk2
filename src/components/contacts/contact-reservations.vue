<template>
  <b-card class="integrations-wrapper border-0" v-if="!isEmpty(reservations)" data-testid="contact-reservations-wrapper">
    <h4 class="mb-2">
      Guesty Reservations
    </h4>

    <q-card
      data-testid="contact-reservations-card"
      v-for="(reservation, key) in reservations.reservations"
      :key="key"
      bordered
      class="my-card"
      style='margin-bottom: 10px'>
      <b-link target="_blank"
              style='text-decoration: none !important; color:inherit !important;'
              data-testid="contact-reservations-link"
              :href="reservation.reservation_link">
        <q-card-section data-testid="contact-reservations-card-section">
          <div class="text-subtitle2" data-testid="contact-reservations-confirmation-code">
            Confirmation Code:
            <div class='text-caption'>
              {{ reservation.confirmation_code }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-status">
            Status:
            <div class='text-caption'>
              {{ capitalizedStatus(reservation.status) }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-checkin-date">
            Checkin Date:
            <div class='text-caption'>
              {{ reservation.checkin_date | fixFullDateLocal }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-checkout-date">
            Checkout Date:
            <div class='text-caption'>
              {{ reservation.checkout_date | fixFullDateLocal }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-listing-id">
            Listing ID:
            <div class='text-caption'>
              {{ reservation.listing_id }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-guest-count">
            Guests count:
            <div class='text-caption'>
              {{ reservation.guests_count }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-currency">
            Currency:
            <div class='text-caption'>
              {{ reservation.currency }}
            </div>
          </div>
          <div class="text-subtitle2" data-testid="contact-reservations-total-income">
            Total income:
            <div class='text-caption'>
              {{ reservation.total_income }}
            </div>
          </div>
        </q-card-section>
      </b-link>
    </q-card>
  </b-card>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { fixFullDateLocal } from 'src/plugins/filters/datetime.filters'

export default {
  name: 'contact-reservations',

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      reservations: []
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isGuestyEnabled () {
      return this.currentCompany && this.currentCompany.guesty_integration_enabled
    }
  },

  created () {
    this.fetchReservationsData()
  },

  methods: {
    fixFullDateLocal,
    capitalizedStatus (status) {
      return this.$options.filters.capitalize(status)
    },
    fetchContactReservations (contactId) {
      window.axios.get('/api/v1/contact/' + contactId + '/reservations').then(res => {
        this.reservations = res.data
      }).catch(err => {
        console.log(err)
        this.reservations = []
      })
    },

    fetchReservationsData () {
      if (this.contact && this.contact.id && this.isGuestyEnabled) {
        this.fetchContactReservations(this.contact.id)
      }
    },

    isEmpty (obj) {
      return _.isEmpty(obj)
    }
  }

}
</script>
