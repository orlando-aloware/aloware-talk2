<template>
  <button class="task-info-btn">
    <info-icon />
  </button>
</template>

<script>
import InfoIcon from 'components/icons/calls-sm/info-icon'
export default {
  name: 'task-info-btn.vue',
  components: { InfoIcon }
}
</script>

<style scoped>
.task-info-btn {
  width: 24px;
  height: 24px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  background-color: transparent;
}
</style>
