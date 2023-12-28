<template>
  <b-card class="integrations-wrapper border-0" v-if="!isEmpty(messages)">
    <h4 class="mb-2">
      Guesty Messages
    </h4>

    <q-card
      v-for="(message, key) in messages.messages"
      :key="key"
      bordered
      class="my-card"
      style='margin-bottom: 10px'>
        <q-card-section>
          <div class="text-subtitle2">
            Account ID:
            <div class='text-caption'>
              {{ message.account_id }}
            </div>
          </div>
          <div class="text-subtitle2">
            Module:
            <div class='text-caption'>
              {{ message.module }}
            </div>
          </div>
          <div class="text-subtitle2">
            Direction:
            <div class='text-caption'>
              {{ message.direction }}
            </div>
          </div>
          <div class="text-subtitle2">
            Message:
            <div class='text-caption'>
              {{ message.body }}
            </div>
          </div>
        </q-card-section>
    </q-card>
  </b-card>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'contact-reservations-messages',

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      messages: []
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isGuestyEnabled () {
      return this.currentCompany && this.currentCompany.guesty_integration_enabled
    }
  },

  created () {
    this.fetchReservationsMessagesData()
  },

  methods: {
    fetchContactReservationsMessages (contactId) {
      window.axios.get('/api/v1/contact/' + contactId + '/reservations/messages').then(res => {
        this.messages = res.data
      }).catch(err => {
        this.messages = []
        console.log(err)
      })
    },

    fetchReservationsMessagesData () {
      if (this.contact && this.contact.id && this.isGuestyEnabled) {
        this.fetchContactReservationsMessages(this.contact.id)
      }
    },

    isEmpty (obj) {
      return _.isEmpty(obj)
    }
  }

}
</script>
