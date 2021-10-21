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
              no-focus
              separate-close-popup
              anchor="bottom end"
              self="top right"
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
                  <q-icon name="cancel" @click.stop="onSearchClose" class="cursor-pointer" />
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
export default {
  name: 'inbox-searcher',

  components: { SearchIcon, CompactBtn },

  computed: {
    searchIconColor () {
      return !this.searchText ? '#62666E' : '#256EFF'
    }
  },

  data () {
    return {
      searchText: ''
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
      this.$emit('closed')
    },
    onShowMenu () {
      this.setSearcherOpen(true)
      this.$emit('opened')
      this.$refs.inboxSearchInput.$refs.input.focus()
    },
    onHideMenu () {
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
      if ((value && value.length >= 3) || value === '') {
        this.$emit('search', value)
      }
    },
    '$route.params.channel': function () {
      if (this.$route.name === 'Inbox Channel') {
        this.$refs.inboxSearch.hide()
      }
    }
  }
}
</script>
