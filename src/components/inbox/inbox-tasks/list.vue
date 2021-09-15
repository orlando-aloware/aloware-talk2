<template>
  <div>
    <inbox-task-item v-for="(contact, index) in contacts" :key="`contact-item-${index}`"
                     :contact="contact"
                     :loading-contact="loadingContacts"
                     @onItemSelected="onItemSelected">
    </inbox-task-item>
  </div>
</template>

<script>
import InboxTaskItem from 'components/inbox/inbox-tasks/item'
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
    }
  },
  methods: {
    onItemSelected (contact) {
      this.$emit('onItemSelected', contact)
    }
  }
}
</script>
