<template>
  <div class="position-relative">
    <i class="fa fa-search position-absolute form-control-search__icon"></i>
    <q-input
      class="form-control form-control-search mt-2"
      borderless
      dense
      v-model="search"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      />
  </div>
</template>

<script>
import _ from 'lodash'
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
  data () {
    return {
      search: ''
    }
  },
  methods: {
    onInput: _.debounce(function () {
      this.$emit('search', this.search)
    }, 500),
    clearSearch () {
      this.search = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.form-control-search {
  width: 100%;
  height: auto !important;
  font-size: 12px;
  padding-left: 12px !important;
  padding-right: 10px;
  padding-top: 0px;
  padding-bottom: 0px;
  &__icon {
    font-size: 12.5px;
    color: $grey-mid;
    top: 15px;
    left: 10px;
  }
}
.form-control-search::-webkit-input-placeholder {
  font-size: 12px;
}
</style>
