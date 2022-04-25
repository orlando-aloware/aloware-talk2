<template>
  <div class="w-100 inbox-search">
    <q-list>
      <q-item>
        <q-item-section>
          <q-input filled
                   ref="inboxSearchInput"
                   placeholder="Search Contacts & Phone Numbers"
                   debounce="500"
                   v-model="searchText">
            <template v-slot:append>
              <q-item-section @click.stop="$emit('closed')"
                              class="cursor-pointer">
                <close-o-icon></close-o-icon>
              </q-item-section>
            </template>
            <q-tooltip  anchor="bottom left"
                        self="bottom left"
            v-if="!searchText || (searchText && searchText.length < 3)">
              requires 3 characters
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
      this.$emit('searching', this.searchText)
    }
  }
}
</script>
