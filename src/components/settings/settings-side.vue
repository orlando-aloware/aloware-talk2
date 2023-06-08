<template>
  <div class="page-side-menubar border-top-0">
    <div class="page-side-menubar__left settings overflow-y-scroll"
         :class="{'page-side-menubar__left--closed': closed }">

      <div class="header w-100 ml-3 mt-2">
        <q-select
            ref="settingsSearcher"
            class="bottom-border__none padding-left__none settings-searcher"
            placeholder="Search settings..."
            hide-dropdown-icon
            clearable
            dense
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            option-value="title"
            option-label="description"
            map-options
            v-model="link"
            :display-value="link ? link.title : ''"
            :options="options"
            @filter="filterFn"
            style="width: 250px;"
        >

          <template v-slot:prepend>
            <q-icon name="search" />
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps"
                    v-on="scope.itemEvents"
            >
              <q-item-section>
                <q-item-label v-html="scope.opt.title"></q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:selected-item="scope">
            <q-item-label v-html="scope.opt.title"/>
          </template>

          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey pt-1 pb-1 pl-2 pr-2">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
import { mapActions, mapGetters, mapState } from 'vuex'
import SettingsNavList from 'components/settings/settings-nav/settings-nav-list'
import settingsMap from './settings-map'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'settings-side',

  mixins: [aclMixin],

  components: {
    SettingsNavList
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
      options: [],
      link: null,
      settingsMap
    }
  },

  computed: {
    ...mapState('settings', ['userClone', 'changedUserProperties', 'user']),
    ...mapGetters('auth', ['authenticated', 'profile']),
    searchResult () {
      const query = this.searchText.trim().toLocaleLowerCase()

      const mapping = Object.values(this.settingsMap)

      if (!this.isAdmin) {
        // eslint-disable-next-line no-return-assign
        mapping.filter(item => ['visibility', 'account-level-notifications'].includes(item.tag)).map(item => item.visible = false)
      }

      // eslint-disable-next-line no-return-assign
      mapping.filter(item => ['secondary-phone-number'].includes(item.hash_keyword)).map((item) => item.visible = this.user.enabled_two_legged_outbound)

      if (!query) {
        return mapping
      }

      return mapping.filter(data => {
        return (data.title.toLocaleLowerCase().includes(query) || data.description.toLocaleLowerCase().includes(query)) && data.visible
      })
    },
    hasAdminRole () {
      return this.user && (this.isCompanyAdmin || this.isBillingAdmin)
    },
    isCompanyAdmin () {
      return this.user.role_names.includes('Company Admin')
    },
    isBillingAdmin () {
      return this.user.role_names.includes('Billing Admin')
    }
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
    ...mapActions('settings', ['resetChangedUserProperties', 'setUser', 'setFormValidity']),
    toggle () {
      this.closed = !this.closed
    },

    toggleOnResize () {
      this.closed = window.innerWidth < 992
    },

    filterFn (val, update, abort) {
      if (val.length < 2) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.searchResult.filter(item => (item.title.toLowerCase().indexOf(needle) > -1 || item.description.toLowerCase().indexOf(needle) > -1) && item.visible)
      })
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },

  watch: {
    link: function () {
      if (this.link) {
        if (this.changedUserProperties.length > 0 && this.link.route !== this.$route.path) {
          this.setUser({ ...this.userClone })
          this.resetChangedUserProperties()
          this.setFormValidity(true)
        }

        this.$router.push({
          path: this.link.route + (this.link.hash_keyword ? '#' + this.link.hash_keyword : '')
        })
        this.$refs.settingsSearcher.blur()
        this.link = null
      }
    }
  }
}
</script>
