<template>
  <div class="w-100 inbox-search" data-testid="search-toggle-wrapper">
    <q-list>
      <q-item>
        <q-item-section data-testid="search-toggle-section">
          <q-input filled
                   ref="inboxSearchInput"
                   placeholder="Search Contacts & Phone Numbers"
                   debounce="500"
                   data-testid="search-toggle-input-search-text"
                   v-model="searchText">
            <template v-slot:append>
              <q-item-section @click.stop="$emit('closed')"
                              class="cursor-pointer">
                <close-o-icon></close-o-icon>
              </q-item-section>
            </template>
            <q-tooltip anchor="bottom left"
                       self="bottom left"
                       data-testid="search-toggle-tooltip"
                       v-if="!searchText || (searchText && searchText.length < 3)">
              Search requires at least 3 characters
            </q-tooltip>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import CloseOIcon from 'components/icons/close-o-icon'

export default {
  name: 'search-toggle',

  components: { CloseOIcon },

  data () {
    return {
      searchText: ''
    }
  },

  methods: {
    inputFocus () {
      this.$nextTick(function () {
        this.$refs.inboxSearchInput.$refs.input.focus()
      }.bind(this))
    }
  },

  watch: {
    'searchText': function () {
      this.searchText = this.searchText.trim()
      this.$emit('searching', this.searchText)
    }
  }
}
</script>
