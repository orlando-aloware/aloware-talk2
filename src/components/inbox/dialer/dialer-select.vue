<template>
<div class="dialer-select">
  <div class="dialer-select__label">
    Call using:
  </div>
  <div class="dialer-select__value">
    <span class="dialer-select__item">Aloware Main (000) 123-4567</span>
    <div class="dialer-select__icon"><i class="gg-chevron-down"></i></div>
  </div>
</div>
</template>

<script>
export default {
  name: 'dialer-select.vue'
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.gg-chevron-down {
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs,1));
  width: 5px;
  height: 5px;
  border: 1px solid transparent;
  border-radius: 100px
}
.gg-chevron-down::after {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 5px;
  height: 5px;
  border-bottom: 1px solid;
  border-right: 1px solid;
  transform: rotate(45deg);
  left: 4px;
  top: 2px
}
.dialer-select {
  display: flex;
  flex-direction: column;
  &__label {
    font-size: 12px;
    color: $grey-light5;
    line-height: 16px;
    opacity: 0.9;
  }
  &__value {
    font-size: 13px;
    font-weight: bold;
    line-height: 18px;
    padding-right: 5px;
    display: flex;
    align-items: center;
    cursor: pointer;
    opacity: 0.9;
  }
  &__item {
    margin-right: 5px;
  }
  &__icon {
    margin-top: -10px;
  }
}
</style>
