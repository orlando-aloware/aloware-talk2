<template>
  <div class="page-side-menubar border-top-0">
    <div class="page-side-menubar__left settings"
         :class="{'page-side-menubar__left--closed': closed }">

      <calls-header :isSearch="true"
                    ref="searcher"
                    search-placeholder="Search settings"
                    @blur="onSearchBlur"
                    @focus="onSearchFocus"
                    @search="search">
      </calls-header>
      <div>
        <q-menu no-parent-event
                auto-close
                no-focus
                no-refocus
                ref="menuLinks"
                content-class="settings-menu-links"
                max-width="20vw"
                max-height="80vh"
                :offset="[-40, -5]">
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup
                    v-for="result in searchResult"
                    :key="result.title"
                    @click="redirectTo(result)">
              <q-item-section>
                <q-item-label>{{ result.title }}</q-item-label>
                <q-item-label caption>
                  {{ result.description }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <div>
        <div class="inbox-side__nav">
          <settings-nav-list>
          </settings-nav-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import CallsHeader from 'components/inbox/calls/calls-header'
import SettingsNavList from 'components/settings/settings-nav/settings-nav-list'
import settingsMap from './settings-map'
import _ from 'lodash'

export default {
  name: 'settings-side',

  components: {
    SettingsNavList,
    CallsHeader
  },

  data () {
    return {
      active: 'general_information',
      closed: window.innerWidth < 992,
      searchText: '',
      sort: '',
      searchFields: ['name', 'phone_number', 'email'],
      currentPage: 0,
      hasMore: false,
      isLoadingMore: false,
      isLoaded: true,
      settingsMap
    }
  },

  computed: {
    ...mapState(['campaigns', 'ringGroups']),
    searchResult () {
      let query = this.searchText.trim().toLocaleLowerCase()

      if (!query) {
        return Object.values(this.settingsMap)
      }

      return _.filter(this.settingsMap, data => {
        return data.title.toLocaleLowerCase().includes(query) || data.description.toLocaleLowerCase().includes(query)
      })
    }
  },

  created () {
  },

  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },

  activated () {
    this.active = 'general_information'
  },

  deactivated () {
    this.active = 'general_information'
  },

  methods: {
    toggle () {
      this.closed = !this.closed
    },

    toggleOnResize () {
      this.closed = window.innerWidth < 992
    },

    search (value) {
      this.searchText = value || ''
    },

    onSearchFocus (value) {
      // this.toggleLinks()
    },

    onSearchBlur () {
      // this.$refs.menuLinks.hide()
    },

    newActive (active) {
      this.setActiveChannel(active)
    },

    redirectTo (item) {
      this.resetSearch()
      this.$router.push({
        path: item.route + (item.hash_keyword ? '#' + item.hash_keyword : '')
      })
    },

    resetSearch () {
      this.searchText = ''
    },

    toggleLinks () {
      if (this.searchResult && this.searchResult.length > 0) {
        this.$refs.menuLinks.show()
      } else {
        this.$refs.menuLinks.hide()
      }
    },

    ...mapActions('inbox', ['gettingTasksList', 'setActiveChannel', 'resetInboxVuex', 'setCommunications'])
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },

  watch: {
    'searchResult': function (results) {
      this.toggleLinks()
    }
  }
}
</script>
