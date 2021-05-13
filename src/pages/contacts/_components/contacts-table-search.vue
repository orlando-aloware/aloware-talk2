<template>
  <div class="position-relative">
    <i class="fa fa-search position-absolute form-control-search__icon"></i>
    <input
      :placeholder="placeholder"
      type="search"
      class="form-control form-control-search"
      :disabled="disabled"
      @keyup="onKeyUp"
    />
  </div>
</template>

<script>
export default {
  props: {
    placeholder: {
      type: String,
      default: 'Search name, phone, address'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onKeyUp (evt) {
      if (evt.keyCode === 13 || evt.target.value === '') {
        this.$emit('search', evt.target.value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.form-control-search {
  width: 100%;
  height: 32px;
  font-size: 12px;
  padding-left: 28px;
  padding-right: 10px;
  padding-top: 0px;
  padding-bottom: 0px;
  &__icon {
    font-size: 12.5px;
    color: $grey-mid;
    top: 10px;
    left: 10px;
  }
}
.form-control-search::-webkit-input-placeholder {
  font-size: 12px;
}
</style>
