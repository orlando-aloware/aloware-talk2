<template>
  <div class="position-relative">
    <q-input
      class="form-control form-control-search mt-2"
      borderless
      dense
      v-model="search"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    >
      <template v-slot:prepend>
        <i class="fa fa-search form-control-search__icon"></i>
      </template>
    </q-input>
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
@import '../../css/mixins';
@import '../../css/variables';
.form-control-search {
  width: 100%;
  height: 32px !important;
  font-size: 12px;
  &__icon {
    font-size: 12.5px;
    color: $grey-mid;
  }
}
.form-control-search::-webkit-input-placeholder {
  font-size: 12px;
}
</style>
