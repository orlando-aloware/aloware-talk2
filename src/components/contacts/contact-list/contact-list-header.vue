<template>
<div class="contacts-list-header">
  <div class="contacts-list-header__inner">
    <div class="contacts-list-header__label">
      Lists
    </div>
    <button class="contacts-list-header__btn">
      <plus-icon width="16" height="16" />
    </button>
  </div>
</div>
</template>

<script>
import PlusIcon from 'components/icons/contacts/plus-icon'
export default {
  name: 'contacts-list-header.vue',
  components: { PlusIcon }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.contacts-list-header {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: solid 1px $grey-light3;
  &__inner {
    display: flex;
    align-items: center;
    flex-grow: 1;
    padding-left: 20px;
    padding-right: 20px;
  }
  &__label {
    flex-grow: 1;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.3px;
    line-height: 14px;
    text-transform: uppercase;
  }
  &__btn {
    margin: 0;
    padding: 0;
    border: 0;
    background-color: transparent;
  }
}
</style>
