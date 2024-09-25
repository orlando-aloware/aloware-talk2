<template>
  <div class="position-relative d-flex">
    <q-input class="form-control-search form-control-search-component"
             borderless
             clearable
             data-testid="search-input"
             :class="[border ? 'form-control' : 'border-0', isInvalid ? 'is-invalid' : '']"
             :placeholder="placeholder"
             :disabled="disabled"
             v-model="searchValue"
             @blur="onBlur"
             @focus="onFocus"
             @clear="onInput"
             @keyup.enter="onInput"
             @keyup="onLiveSearch">
       <template v-slot:prepend>
        <span class="search-icon-component"
              @click="onInput">
          <search-icon />
        </span>
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
    }
  },

  data () {
    return {
      searchValue: '',
      isInvalid: false
    }
  },

  created () {
    this.searchValue = this.search
  },

  methods: {
    onInput: function () {
      // send an empty string on null value
      // (happens when page is from contact page - clicked from result)
      if (!this.searchValue) {
        this.searchValue = ''
      }

      const hasError = this.showErrorMessage

      this.isInvalid = hasError
      this.$emit('show-error-message', hasError)
      this.$emit('search', this.searchValue)
    },

    onLiveSearch: function () {
      if (!this.searchValue) {
        this.onInput()
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
    }
  },

  watch: {
    search () {
      this.searchValue = this.search
    }
  },

  computed: {
    showErrorMessage () {
      return !this.limitSearchCharacters && this.searchValue.length > 0 && this.searchValue.length < 3
    }
  }
}
</script>
