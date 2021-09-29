<template>
  <div class="task-list scrollable w-100">
    <p class="text-center mt-5" v-if="communications.length < 1">
      No {{ this.channel | capitalize }}
    </p>
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
