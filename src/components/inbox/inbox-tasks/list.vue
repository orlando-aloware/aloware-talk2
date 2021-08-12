<template>
  <div>
    <inbox-task-item v-for="contact in contacts" :key="contact.id"
                     :contact="contact">
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
    }
  }
}
</script>
