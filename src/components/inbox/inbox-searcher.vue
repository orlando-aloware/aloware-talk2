<template>
  <div class="position-absolute search-icon search-wrapper">
    <compact-btn borderless
                 customClass="fs-14 _500 position-relative primary not-focusable filter-toggle-button"
                 variant="outlined-light"
                 @click="onButtonClick">
      <search-icon :color="searchIconColor"></search-icon>
      <q-menu :offset="[271, 0]"
              content-class="inbox-search"
              ref="inboxSearch"
              separate-close-popup
              anchor="bottom end"
              self="top right"
              no-focus
              persistent
              @hide="onHideMenu"
              @show="onShowMenu">
        <q-list style="min-width: 305px">
          <q-item>
            <q-item-section>
              <q-input filled
                       ref="inboxSearchInput"
                       placeholder="Search Contacts & Phone Numbers"
                       debounce="500"
                       v-model="searchText">
                <template v-slot:append>
                  <q-item-section @click.stop="onSearchClose"
                                  class="cursor-pointer">
                    <close-o-icon></close-o-icon>
                  </q-item-section>
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </compact-btn>
  </div>
</template>

<script>
import CompactBtn from 'components/compact-btn'
import SearchIcon from 'components/icons/search-icon'
import { mapActions } from 'vuex'
import CloseOIcon from 'components/icons/close-o-icon'
export default {
  name: 'inbox-searcher',

  components: { CloseOIcon, SearchIcon, CompactBtn },

  computed: {
    searchIconColor () {
      return !this.isOpen ? '#62666E' : '#256EFF'
    }
  },

  data () {
    return {
      searchText: '',
      isOpen: false
    }
  },

  methods: {
    ...mapActions('inbox', ['setSearcherOpen']),
    onButtonClick () {
      this.$refs.inboxSearch.show()
    },
    onSearchClose () {
      this.searchText = null
      this.$refs.inboxSearch.hide()
    },
    onShowMenu () {
      this.isOpen = true
      this.setSearcherOpen(true)
      this.$emit('opened')
      this.$refs.inboxSearchInput.$refs.input.focus()
    },
    onHideMenu () {
      this.isOpen = false
      this.setSearcherOpen()
      this.searchText = null
      this.$emit('closed')
    },
    reset () {
      this.searchText = null
    }
  },

  watch: {
    'searchText': function (value) {
      this.$emit('search', value)
    },
    '$route.params.channel': function () {
      if (this.$route.name === 'Inbox Channel') {
        this.$refs.inboxSearch.hide()
      }
    }
  }
}
</script>
