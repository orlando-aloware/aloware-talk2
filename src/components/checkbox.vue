<template>
  <label for="checker" class="checkbox">
    <input type="checkbox" id="checker" class="checkbox__input"/>
    <div class="checkbox__mark">
      <check-icon/>
    </div>
  </label>
</template>

<script>
import CheckIcon from 'components/icons/check-icon'

export default {
  name: 'checkbox.vue',
  components: { CheckIcon }
}
</script>

<style lang="scss" scoped>
@import '../css/mixins';
@import '../css/variables';

.checkbox {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &__input {
    position: absolute;
    left: -36px;
    top: -36px;
  }

  &__input ~ div {
    width: 18px;
    height: 18px;
    background-color: $white;
    @include border-radius(2px);
    border: solid 2px $grey-mid;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 100ms ease-in;

    svg {
      display: none;
    }
  }

  &__input:checked ~ div {
    background-color: $green;
    border-color: $green;

    svg {
      display: block;
    }
  }
}
</style>
