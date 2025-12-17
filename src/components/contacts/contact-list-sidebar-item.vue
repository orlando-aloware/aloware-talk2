<template>
  <b-list-group-item class="d-flex align-items-center border-0 cursor-pointer"
                     data-testid="contact-list-sidebar-item"
                     @click="onItemSelected">
    <div class="d-flex align-items-center border-0 w-100">
      <avatar class="contact-avatar"
              width="34"
              height="34"
              data-testid="contact-list-sidebar-avatar"
              :name="contactName">
      </avatar>
      <div class="ml-2 d-flex flex-column justify-content-center align-items-start contact-details pt-0">
        <div class="text-bold contact-name mb-0 w-100">
          <q-tooltip anchor="top middle"
                     data-testid="contact-list-sidebar-contact-name-tooltip"
                     self="center middle">
            {{ contactName }}
          </q-tooltip>
          {{ contactName }}
        </div>
        <div class="contact-phone w-100">
          <span v-if="contactItem.phone_number !== '0'">{{ contactItem.phone_number | fixPhone }}</span>
          <span v-else>Phone number unavailable</span>
        </div>
      </div>
      <div class="d-flex justify-center align-items-center">
        <b-badge v-if="unreadCount > 0"
                 class="contact-badge d-flex justify-center align-items-center bg-red-80"
                 variant="danger"
                 data-testid="contact-list-sidebar-unread-badge"
                 pill>
          {{ unreadCount }}
        </b-badge>
      </div>
    </div>
  </b-list-group-item>
</template>

<script>
import Avatar from 'components/avatar'
import { mapGetters } from 'vuex'
import {
  aclMixin,
  visibilityMixin
} from 'src/plugins/mixins'

export default {
  name: 'contact-list-sidebar-item',

  mixins: [
    aclMixin,
    visibilityMixin
  ],

  components: { Avatar },

  computed: {
    ...mapGetters('contacts', ['contact']),
    contactName () {
      return this.contactItem.name || 'No Name'
    },
    unreadCount () {
      return this.contactItem.unread_texts_count + this.contactItem.unread_missed_calls_count + this.contactItem.unread_voicemails_count
    }
  },

  props: {
    value: {
      type: Object,
      required: true
    }
  },

  methods: {
    onItemSelected () {
      this.$emit('itemSelected')
    }
  },

  data () {
    return {
      contactItem: this.value
    }
  },

  mounted () {
    this.contactItem = this.value
  },

  watch: {
    contact: {
      deep: true,
      handler (value) {
        if (this.contactItem.id === value.id) {
          this.contactItem = value
        }
      }
    }
  }
}
</script>
