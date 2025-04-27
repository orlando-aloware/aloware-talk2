<template>
  <div class="teaminbox-tab__header border-bottom">
    <collapse-button class="teaminbox-tab__header__collapse-button"
                     :target="collapseTarget"
                     v-model="collapsed"
                     v-if="collapseTarget && !isMobile"/>

    <template v-if="!isSearchActive">
      <label class="teaminbox-tab__header__label ellipse"
             v-if="activeInbox.name">
        {{ activeInbox.name }}
      </label>
      <q-space></q-space>

      <span class="cursor-pointer mr-2"
            :id="`teaminbox-tab-open-comms-page-icon-${_uid}`"
            @click="$router.push(DEFAULT_COMMUNICATIONS_ROUTE_PATH)">
        <watch-icon />
        <b-tooltip custom-class="talk-table__tooltip"
                   :target="`teaminbox-tab-open-comms-page-icon-${_uid}`">
          Open Communications Page
        </b-tooltip>
      </span>

      <span class="cursor-pointer"
            :id="`teaminbox-tab-search-icon-${_uid}`"
            @click="onEnterSearch">
        <search-icon color="#256eff"
                     width="18"
                     height="18" />
        <b-tooltip custom-class="talk-table__tooltip"
                   :target="`teaminbox-tab-search-icon-${_uid}`">
          Click to search
        </b-tooltip>
      </span>
    </template>

    <template v-else>
      <search-input no-clear-on-route-change
                    ref="search"
                    placeholder="Type ENTER to search comms..."
                    class="teaminbox-tab__header__search"
                    limit-search-characters
                    :id="`teaminbox-tab-search-${_uid}`"
                    @search="$emit('search', $event)"
                    @blur="onLeaveSearch"
                    @focus="setShowSearchTooltip(true)"
                    @show-error="showLimitCharactersError"/>
      <b-tooltip custom-class="talk-table__tooltip"
                 placement="top"
                 :boundary="`teaminbox-tab-search-${_uid}`"
                 :target="`teaminbox-tab-search-${_uid}`"
                 :show="showSearchTooltip">
        Search communications by contact's name or phone number
      </b-tooltip>
    </template>
  </div>
</template>

<script>
import SearchInput from 'src/components/search-input.vue'
import WatchIcon from 'src/components/icons/watch-icon.vue'
import SearchIcon from 'src/components/icons/search-icon.vue'
import CollapseButton from 'src/components/collapse-button.vue'
import { DEFAULT_COMMUNICATIONS_ROUTE_PATH } from 'src/router/routes'
import { mapState } from 'vuex'

export default {
  props: {
    collapseTarget: {
      type: HTMLElement,
      default: null
    },

    search: {
      type: String,
      required: true
    }
  },

  components: {
    CollapseButton,
    SearchInput,
    WatchIcon,
    SearchIcon
  },

  data: () => ({
    isSearchActive: false,
    showSearchTooltip: false,
    collapsed: false,
    DEFAULT_COMMUNICATIONS_ROUTE_PATH
  }),

  computed: {
    ...mapState('TeamInbox', [
      'viewMode',
      'activeInbox'
    ]),

    ...mapState(['isMobile'])
  },

  methods: {
    async onEnterSearch () {
      this.isSearchActive = true

      await this.$nextTick()

      // auto focus inside inner search input
      if (this.$refs.search) {
        this.$refs.search.$el.querySelector('input').focus()
      }
    },

    onLeaveSearch () {
      if (this.search === '') {
        this.isSearchActive = false
      }
    },

    setShowSearchTooltip (show) {
      this.showSearchTooltip = show
    },

    showLimitCharactersError (show) {
      if (show) {
        this.$generalNotification('Search requires at least 3 characters', 'error')
      }
    }
  },

  watch: {
    search (search) {
      if (search === '') {
        this.isSearchActive = false
      }

      this.$emit('search', search)
    }
  }
}
</script>

<style lang="scss">
.teaminbox-tab__header {
  display: flex;
  align-items: center;
  padding: 6px 15px;
  width: 100%;
  height: 45px;

  &__label {
    margin: 0px;
    font-weight: 500;
    font-size: 16px;
    flex-grow: 1;
  }

  &__search {
    width: 100%;

    label {
      border: none;
    }
  }

  @media(min-width: 785px) {
    & {
      &__label {
        margin-left: 10px;
      }

      &__search {
        .q-field__prepend {
          padding-left: 5px !important;
        }
      }
    }
  }
}
</style>
