<template>
  <button class="task-drop-btn">
    <drop-icon width="60" height="60" />
  </button>
</template>

<script>
import DropIcon from 'components/icons/drop-icon'
export default {
  name: 'task-drop-btn.vue',
  components: {
    DropIcon
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.task-drop-btn {
  width: 60px;
  height: 60px;
  border: none;
  @include border-radius(50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover {
    box-shadow: 0 3px 10px 0 rgba(250,0,63,0.3);
  }
}
</style>
