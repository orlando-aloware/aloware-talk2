<template>
  <div class="task-contact">
    <div class="task-contact__name">{{ name }}</div>
    <div class="task-contact__number">{{ number }}</div>
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.task-contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &__name {
    color: $black;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.5px;
    line-height: 26px;
    margin-bottom: 5px;
  }
  &__number {
    color: $grey-dark;
    font-size: 16px;
    letter-spacing: 0;
    line-height: 21px;
  }
}
</style>
