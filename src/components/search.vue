<template>
  <div class="position-relative">
    <q-input
      class="form-control-search mt-2"
      :class="[border ? 'form-control' : '']"
      borderless
      v-model="search"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    >
      <template v-slot:prepend>
        <search-icon />
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
      default: 'Search name, phone, address'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: true
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
