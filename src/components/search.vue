<template>
  <div class="position-relative">
    <q-input :class="[border ? 'form-control' : 'border-0']"
             :placeholder="placeholder"
             :disabled="disabled"
             class="form-control-search"
             v-model="searchValue"
             borderless
             clearable
             @blur="onBlur"
             @focus="onFocus"
             @clear="onInput"
             @input="onInput">
      <template v-slot:prepend>
        <search-icon/>
      </template>
      <template v-slot:default>
        <q-tooltip  anchor="bottom middle"
                    self="center middle"
                    v-if="!searchValue || (searchValue && searchValue.length < 3)">
          Search requires at least 3 characters
        </q-tooltip>
      </template>
    </q-input>
  </div>
</template>

<script>
import _ from 'lodash'
import SearchIcon from 'components/icons/search-icon'

export default {
  components: { SearchIcon },

  props: {
    placeholder: {
      type: String,
      default: 'Search name, phone, email, etc.'
    },

    disabled: {
      type: Boolean,
      default: false
    },

    border: {
      type: Boolean,
      default: true
    },

    search: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      searchValue: ''
    }
  },

  created () {
    this.searchValue = this.search
  },

  methods: {
    onInput: _.debounce(function () {
      this.$emit('search', this.searchValue)
    }, 500),

    onFocus: function () {
      this.$emit('focus', this.searchValue)
    },

    onBlur: function () {
      this.$emit('blur', this.searchValue)
    },

    clearSearch () {
      this.searchValue = ''
    }
  },

  watch: {
    search () {
      this.searchValue = this.search
    }
  }
}
</script>
