<template>
  <div class="position-relative">
    <q-input :class="[border ? 'form-control' : 'border-0']"
             :placeholder="placeholder"
             :disabled="disabled"
             class="form-control-search"
             v-model="searchValue"
             borderless
             clearable
             data-testid="search-input"
             @blur="onBlur"
             @focus="onFocus"
             @clear="onInput"
             @input="onInput">
      <template v-slot:prepend>
        <search-icon/>
      </template>
      <template v-slot:default
                v-if="limitSearchCharacters">
        <q-tooltip anchor="bottom middle"
                   self="center middle"
                   data-testid="search-tooltip"
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
    },

    limitSearchCharacters: {
      type: Boolean,
      default: false
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
      // send an empty string on null value
      // (happens when page is from contact page - clicked from result)
      if (!this.searchValue) {
        this.searchValue = ''
      }

      this.searchValue = this.searchValue.trim()
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
