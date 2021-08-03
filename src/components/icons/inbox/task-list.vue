<template>
    <div class="task-list scrollable w-100">
      <task-item v-for="communication in communications"
                 :key="communication.id"
                 :communication="communication">
      </task-item>
    </div>
</template>

<script>
import TaskItem from 'components/icons/inbox/task-item'

export default {
  name: 'task-list',

  components: { TaskItem },

  props: {
    communications: {
      required: true
    }
  }
}
</script>
