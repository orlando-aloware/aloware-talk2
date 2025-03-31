<template>
  <div class="position-relative">
    <q-input :class="[{ 'input-error': hasError}, border ? 'form-control' : 'border-0']"
             :placeholder="placeholder"
             :disabled="disabled"
             class="form-control-search"
             v-model="searchValue"
             borderless
             clearable
             data-testid="search-input"
             @blur="onBlur"
             @focus="onFocus"
             @clear="clearSearch"
             @keyup.enter="onSearch"
             @input="onInput">
      <template v-slot:prepend>
        <span class="search-icon-component"
              @click="onSearch">
          <search-icon/>
        </span>
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
      default: 'Press ENTER to search...'
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
    },

    limitSearchCharacters: {
      type: Boolean,
      default: false
    },

    searchOnInput: {
      type: Boolean,
      default: false
    },

    noClearOnRouteChange: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      searchValue: '',
      hasError: false
    }
  },

  created () {
    this.searchValue = this.search
  },

  methods: {
    onSearch: _.debounce(function () {
      if (!this.searchValue) {
        this.searchValue = ''
      }
      this.$emit('search', this.searchValue)
      if (this.limitSearchCharacters && this.searchValue && this.searchValue.trim().length < 3) {
        this.hasError = true
      } else {
        this.hasError = false
      }
      this.$emit('show-error', this.hasError)
    }, 500),

    onInput () {
      if (!this.searchValue || this.searchValue.trim().length > 2) {
        this.hasError = false
        this.$emit('show-error', this.hasError)
      }

      if (this.searchOnInput) {
        this.onSearch()
      }
    },

    onFocus: function () {
      this.$emit('focus', this.searchValue)
    },

    onBlur: function () {
      this.$emit('blur', this.searchValue)
    },

    clearSearch () {
      this.searchValue = ''
      this.hasError = false
      this.$emit('show-error', false)
      this.$emit('search', this.searchValue)
    }
  },

  watch: {
    '$route.query': function () {
      if (!this.noClearOnRouteChange) {
        this.searchValue = ''
      }
    }
  }
}
</script>
