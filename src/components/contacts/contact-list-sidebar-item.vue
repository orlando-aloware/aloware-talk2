<template>
  <div class="d-flex align-items-center border-0 w-100">
    <avatar class="contact-avatar"
            width="34"
            height="34"
            :name="contactName">
    </avatar>
    <div class="ml-2 d-flex flex-column justify-content-center align-items-start contact-details pt-0">
      <div class="text-bold contact-name mb-0 w-100">
        <q-tooltip anchor="top middle"
                   self="center middle">
          {{ contactName }}
        </q-tooltip>
        {{ contactName }}
      </div>
      <div class="contact-phone w-100">
        <span v-if="listContact.phone_number !== '0'">{{ listContact.phone_number | fixPhone }}</span>
        <span v-else>Phone number unavailable</span>
      </div>
    </div>
    <div class="d-flex justify-center align-items-center">
      <b-badge v-if="totalUnread > 0"
               class="contact-badge d-flex justify-center align-items-center"
               variant="danger"
               pill>
        {{ totalUnread }}
      </b-badge>
    </div>
  </div>
</template>

<script>
import Avatar from 'components/avatar'
import { mapGetters } from 'vuex'

export default {
  name: 'contact-list-sidebar-item',

  components: { Avatar },

  computed: {
    ...mapGetters('contacts', ['contact']),
    contactName () {
      return this.listContact.name || 'No Name'
    },
    listContact: {
      get () {
        return this.sideBarContact
      },
      set (val) {
        this.sideBarContact = val
      }
    },
    totalUnread () {
      return this.listContact.unread_texts_count + this.listContact.unread_missed_calls_count + this.listContact.unread_voicemails_count
    }
  },

  props: {
    value: {
      required: true
    }
  },

  data () {
    return {
      sideBarContact: this.value
    }
  },

  watch: {
    'contact': function (value) {
      if (this.listContact.id === value.id) {
        this.listContact = value
      }
    }
  }
}
</script>
