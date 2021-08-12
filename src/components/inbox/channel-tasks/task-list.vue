<template>
    <div class="task-list scrollable w-100">
      <task-item v-for="communication in communications"
                 :key="communication.id"
                 :communication="communication"
                 :channel="channel"
                 :answer-status="answerStatus">
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
    }
  }
}
</script>
