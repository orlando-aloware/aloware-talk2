<template>
  <b-card class="integrations-wrapper border-0" v-if="!isEmpty(reservations)">
    <h4 class="mb-2">
      Guesty Reservations
    </h4>

    <q-card
      v-for="(reservation, key) in reservations.reservations"
      :key="key"
      bordered
      class="my-card"
      style='margin-bottom: 10px'>
      <b-link target="_blank"
              style='text-decoration: none !important; color:inherit !important;'
              :href="reservation.reservation_link">
        <q-card-section>
          <div class="text-subtitle2">
            Confirmation Code:
            <div class='text-caption'>
              {{ reservation.confirmation_code }}
            </div>
          </div>
          <div class="text-subtitle2">
            Listing:
            <div class='text-caption'>
              {{ reservation.listing_nickname }}
            </div>
          </div>
          <div class="text-subtitle2">
            Status:
            <div class='text-caption'>
              {{ reservation.status }}
            </div>
          </div>
          <div class="text-subtitle2">
            Checkin Date:
            <div class='text-caption'>
              {{ reservation.checkin_date }}
            </div>
          </div>
          <div class="text-subtitle2">
            Checkout Date:
            <div class='text-caption'>
              {{ reservation.checkout_date }}
            </div>
          </div>
        </q-card-section>
      </b-link>
    </q-card>
  </b-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'contact-reservations',

  props: {
    contact: {
      type: Object,
      required: true
    },

    no_title: {
      type: Boolean,
      required: false,
      default: false
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
      return !!(this.currentCompany &&
        this.currentCompany.guesty_integration_enabled)
    },

    autoHeightClass () {
      return this.expanded ? 'auto-height' : 'overflow-hidden'
    }
  },

  created () {
    this.fetchReservationsData()
  },

  methods: {
    fetchContactReservations (contactId) {
      window.axios.get('/api/v1/contact/' + contactId + '/reservations').then(res => {
        this.reservations = res.data
      })
    },

    fetchReservationsData (force = false) {
      if (this.contact && this.contact.id) {
        if (this.isGuestyEnabled) {
          this.fetchContactReservations(this.contact.id)
        }
      }
    },

    isEmpty (obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object
    }
  }

}
</script>
