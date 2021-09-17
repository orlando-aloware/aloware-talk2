<template>
  <div class="task-list scrollable w-100">
    <task-mention-item v-for="communication in communications"
                       :key="communication.id"
                       :mention="communication"
                       :direction="direction">
    </task-mention-item>
  </div>
</template>

<script>
import TaskMentionItem from 'components/inbox/channel-tasks/task-mention-item'

export default {
  name: 'task-mention-list',

  components: { TaskMentionItem },

  props: {
    communications: {
      required: true
    },

    direction: {
      type: String,
      required: false,
      default: 'received'
    }
  }
}
</script>
