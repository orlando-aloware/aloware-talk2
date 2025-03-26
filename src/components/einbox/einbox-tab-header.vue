<template>
  <div class="einbox-tab__header border-bottom">
    <collapse-button class="einbox-tab__header__collapse-button"
                      :target="collapseTarget"
                      v-model="collapsed"
                      v-if="collapseTarget && !isMobile"/>

    <template v-if="!isSearchActive">
      <label class="einbox-tab__header__label ellipse"
            v-if="activeInbox.name">
        {{ activeInbox.name }}
      </label>
      <q-space></q-space>

      <span class="cursor-pointer mr-2"
            :id="`einbox-tab-open-comms-page-icon-${_uid}`"
            @click="$router.push(DEFAULT_COMMUNICATIONS_ROUTE_PATH)">
        <watch-icon />
        <b-tooltip custom-class="talk-table__tooltip"
                    :target="`einbox-tab-open-comms-page-icon-${_uid}`">
          Open Communications Page
        </b-tooltip>
      </span>

      <span class="cursor-pointer"
            :id="`einbox-tab-search-icon-${_uid}`"
            @click="onEnterSearch">
        <search-icon color="#256eff"
                      width="18"
                      height="18" />
        <b-tooltip custom-class="talk-table__tooltip"
                    :target="`einbox-tab-search-icon-${_uid}`">
          Click to search
        </b-tooltip>
      </span>
    </template>

    <template v-else>
      <search-input no-clear-on-route-change
                    ref="search"
                    placeholder="Type ENTER to search comms..."
                    class="einbox-tab__header__search"
                    :id="`einbox-tab-search-${_uid}`"
                    @search="$emit('search', $event)"
                    @blur="onLeaveSearch"
                    @focus="showSearchTooltip = true"/>
      <b-tooltip custom-class="talk-table__tooltip"
                  placement="top"
                  :boundary="`einbox-tab-search-${_uid}`"
                  :target="`einbox-tab-search-${_uid}`"
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
    ...mapState('Einbox', [
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
.einbox-tab__header {
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
