<template>
<div class="call-active">
  <div class="call-active__name">{{ name }}</div>
  <div class="call-active__time">{{ time }}</div>
  <button class="call-active__icon">
    <drop-on-header-icon />
  </button>
</div>
</template>

<script>
import DropOnHeaderIcon from 'components/icons/drop-on-header-icon'
export default {
  name: 'call-active.vue',
  components: { DropOnHeaderIcon },
  props: {
    name: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.call-active {
  display: flex;
  height: 30px;
  align-items: center;
  @include border-radius(15px);
  background-color: $green;
  &__name {
    color: $white;
    font-size: 12px;
    letter-spacing: 0.3px;
    line-height: 16px;
    padding-left: 15px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  &__time {
    color: $white;
    font-size: 12px;
    letter-spacing: 0.3px;
    line-height: 16px;
    padding-left: 15px;
    font-weight: 400;
    flex-grow: 1;
    padding-right: 10px;
    text-align: right;
  }
  &__icon {
    padding-right: 3px;
    background-color: transparent;
    border: 0;
  }
}
</style>
