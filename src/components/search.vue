<template>
  <div class="position-relative d-flex">
    <q-input class="form-control-search"
             borderless
             clearable
             data-testid="search-input"
             :class="[border ? 'form-control' : 'border-0']"
             :placeholder="placeholder"
             :disabled="disabled"
             v-model="searchValue"
             @clear="onInput"
             @keyup.enter="onInput">
       <template v-slot:prepend>
        <span @click="onInput" class="search-icon-component">
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
      searchValue: ''
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

      this.$emit('search', this.searchValue)
    }
  }
}
</script>
