<template>
  <div class="callheader">
    <div class="callheader__title">
      {{ name }}
    </div>
    <button>
      <close-icon />
    </button>
  </div>
</template>

<script>
import CloseIcon from './../../icons/close-icon.vue'
export default {
  props: {
    name: {
      type: String,
      required: true
    }
  },
  components: {
    CloseIcon
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
button {
  border: none;
  background-color: transparent;
}
.callheader {
  display: flex;
  align-items: center;
  height: 46px;
  border-bottom: solid 1px $grey-light3;
  &__title {
    padding-left: 20px;
    padding-right: 10px;
    flex-grow: 1;
    font-weight: bold;
    color: $black;
    font-size: 16px;
  }
}
</style>
