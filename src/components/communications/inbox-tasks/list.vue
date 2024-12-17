<template>
  <div data-testid="inbox-tasks-list-wrapper">
    <p class="text-center mt-5" v-if="contacts.length < 1 && !loadingContacts && (['open', 'pending', 'closed'].includes($route.params.status) || $route.name === 'Inbox')">{{ emptyPlaceholder }}</p>
    <div class="text-left mt-5 not-in-inbox-label" v-if="contacts.length < 1 && !loadingContacts && $route.params.id && ['new'].includes($route.params.status)">
        This selected contact is <b-badge variant="primary" class="font-weight-light ml-1 mr-1">New</b-badge>. To make it appear in Inbox:
      <br>
      <br>
      1) Make a call, send a message, fax, etc. to the contact and move the contact to <b>Open</b>.
      <br>
      <br>
      OR
      <br>
      <br>
      2) Have the contact send a communication to one of your lines or ring groups. The contact will automatically be moved to <b>Open</b>.
    </div>
    <inbox-task-item v-for="contact in contacts"
                     :key="`${keyPrefix}-item-${contact.id}`"
                     :contact="contact"
                     :loading-contact="loadingContacts"
                     :is-search="isSearch"
                     data-testid="inbox-tasks-list-item"
                     @onItemRemoved="onItemRemoved"
                     @onItemSelected="onItemSelected">
    </inbox-task-item>
  </div>
</template>

<script>
import InboxTaskItem from 'components/inbox/inbox-tasks/item'
import { mapState } from 'vuex'
export default {
  name: 'inbox-task-list',
  components: { InboxTaskItem },
  props: {
    contacts: {
      required: true
    },
    loadingContacts: {
      type: Boolean,
      default: false
    },
    searchText: {
      type: String,
      required: false,
      default: ''
    },
    isSearch: {
      type: Boolean,
      required: false,
      default: false
    },
    keyPrefix: {
      type: String,
      required: false,
      default: 'contact'
    }
  },
  methods: {
    onItemSelected (contact) {
      this.$emit('onItemSelected', contact)
    },
    onItemRemoved (contact) {
      this.$emit('onItemRemoved', contact)
    }
  },
  computed: {
    ...mapState('inbox', ['selectedContact']),
    emptyPlaceholder () {
      return this.searchText && [1, 2].includes(this.searchText.length) ? 'Type at least 3 characters' : 'No Tasks'
    }
  }
}
</script>
