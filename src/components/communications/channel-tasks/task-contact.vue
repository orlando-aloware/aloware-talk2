<template>
  <div class="task-contact">
    <div class="task-contact__name">{{ name }}</div>
    <div class="task-contact__number">{{ number }}</div>
    <div class="task-contact__time">{{ time }}</div>
  </div>
</template>

<script>
export default {
  name: 'task-contact.vue',
  props: {
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: '00:00'
    }
  }
}
</script>
