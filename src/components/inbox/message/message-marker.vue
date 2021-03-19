<template>
<div class="message-day">
  {{ text }}
</div>
</template>

<script>
export default {
  name: 'message-day.vue',
  props: {
    text: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.message-day {
  color: $grey-mid;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 15px;
}
</style>
