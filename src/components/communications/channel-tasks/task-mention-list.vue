<template>
  <div class="task-list scrollable w-100" data-testid="task-mention-list-wrapper">
    <p class="text-center mt-5" v-if="communications.length < 1">{{ emptyPlaceholder }}</p>
    <task-mention-item v-for="communication in communications"
                       :key="communication.id"
                       :mention="communication"
                       :direction="direction"
                       data-testid="task-mention-list-item">
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
    },

    searchText: {
      type: String,
      required: false,
      default: ''
    }
  },

  computed: {
    emptyPlaceholder () {
      return this.searchText && [1, 2].includes(this.searchText.length) ? 'Type at least 3 characters' : 'No Mentions'
    }
  }
}
</script>
