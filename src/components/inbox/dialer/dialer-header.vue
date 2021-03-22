<template>
  <div class="dialer-header">
    <div class="dialer-header__title">
      Dialer
    </div>
    <button @click="toggle">
      <close-icon />
    </button>
  </div>
</template>

<script>
import CloseIcon from 'components/icons/close-icon'
export default {
  props: {
    name: {
      type: String,
      required: true
    }
  },
  methods: {
    toggle () {
      window.dispatchEvent(new CustomEvent('toggleContactInfo'))
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
.dialer-header {
  display: flex;
  align-items: center;
  height: 46px;
  &__title {
    padding-left: 20px;
    padding-right: 10px;
    flex-grow: 1;
    font-weight: bold;
    color: $black;
    font-size: 16px;
    letter-spacing: 0.4px;
  }
}
</style>
