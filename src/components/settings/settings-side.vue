<template>
  <div class="page-side-menubar border-top-0">
    <div class="page-side-menubar__left settings"
         :class="{'page-side-menubar__left--closed': closed }">
      <calls-header :isSearch="true"
                    search-placeholder="Search settings"
                    @search="search"/>
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
      isLoaded: true
    }
  },

  computed: {
    ...mapState(['campaigns', 'ringGroups'])
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
      this.searchText = value
    },

    newActive (active) {
      this.setActiveChannel(active)
    },

    ...mapActions('inbox', ['gettingTasksList', 'setActiveChannel', 'resetInboxVuex', 'setCommunications'])
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  }
}
</script>
