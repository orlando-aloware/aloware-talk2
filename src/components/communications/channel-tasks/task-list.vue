<template>
  <div class="task-list scrollable w-100" data-testid="task-list-wrapper">
    <p class="text-center mt-5" v-if="communications.length < 1">
        {{ emptyPlaceholder }}
    </p>
    <task-item v-for="communication in communications"
               :key="communication.id"
               :communication="communication"
               :channel="channel"
               :answer-status="answerStatus"
               data-testid="task-list-task-item">
    </task-item>
  </div>
</template>

<script>
import TaskItem from 'components/inbox/channel-tasks/task-item'

export default {
  name: 'task-list',

  components: { TaskItem },

  props: {
    communications: {
      required: true
    },

    channel: {
      type: String,
      required: false,
      default: 'calls'
    },

    answerStatus: {
      type: String,
      required: false,
      default: 'all'
    },

    searchText: {
      type: String,
      required: false,
      default: ''
    }
  },

  computed: {
    emptyPlaceholder () {
      return this.searchText && [1, 2].includes(this.searchText.length) ? 'Type at least 3 characters' : 'No ' + this.$options.filters.capitalize(this.channel)
    }
  }
}
</script>
