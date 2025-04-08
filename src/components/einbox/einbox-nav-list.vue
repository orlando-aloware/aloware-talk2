<template>
  <div class="einbox-nav-list"
       data-testid="einbox-nav-list">
    <div class="einbox-nav-list__header border-bottom d-flex flex-column justify-content-center">
      <search-input class="einbox-nav-list__header__search"
                    placeholder="Type ENTER to search inboxes..."
                    data-testid="einbox-search"
                    :id="`einbox-nav-list-search-${_uid}`"
                    @search="onSearch"
                    @focus="showSearchTooltip = true"
                    @blur="showSearchTooltip = false"/>
      <b-tooltip custom-class="talk-table__tooltip"
                 placement="top"
                 :boundary="`einbox-nav-list-search-${_uid}`"
                 :target="`einbox-nav-list-search-${_uid}`"
                 :show="showSearchTooltip">
        Search inboxes by name
      </b-tooltip>
    </div>
    <div :class="['einbox-nav-list__content', { 'einbox-nav-list__content--no-gap': expandedType !== null }]">
      <einbox-nav-type :type="type.id"
                       :label="type.name"
                       :typed-inboxes="type.inboxes"
                       :key="type.name"
                       :active-inbox-id="activeInboxId"
                       :expanded="expandedType === type.id"
                       :reduced="expandedType && expandedType !== type.id"
                       v-for="type in typedInboxes"
                       @inbox="onInboxSelect"
                       @toggle-expanded="onToggleExpanded"
                       @load-more="onLoadMore" />

      <div :class="[isLoadingInboxes ? 'py-5' : 'py-4', 'relative']"
           v-if="isLoadingInboxes">
        <b-overlay rounded="sm"
                   variant="white"
                   data-testid="einbox-nav-list-overlay"
                   :show="isLoadingInboxes">
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars color="primary"
                              size="2em"/>
            </div>
          </template>
        </b-overlay>
      </div>

      <!-- Empty state -->
      <div class="text-center q-pa-md text-grey"
           v-else-if="!inboxes.length">
        No Inboxes

        <br/>

        <button class="btn btn-sm btn-primary mt-4"
                v-if="showRefreshInboxesButton"
                @click.prevent="onRefreshInboxes">
          <refresh-icon color="#fff"/> Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import EinboxNavType from './einbox-nav-type.vue'
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
import SearchInput from 'src/components/search-input.vue'
import RefreshIcon from 'src/components/icons/refresh-icon.vue'
import { EINBOXES_MENU_TITLE } from 'src/router/routes'
import { INBOX_TYPE_PERSONAL, INBOX_TYPE_CONNECTED, INBOX_TYPE_WATCHING } from 'src/store/einbox/einbox.store'
import { mapState, mapActions } from 'vuex'
import { debounce } from 'lodash'

export default {
  components: {
    EinboxNavType,
    SearchInput,
    RefreshIcon
  },

  mixins: [
    EinboxMixin
  ],

  data () {
    return {
      loadMoreInboxesDebounced: debounce(this.loadMoreInboxes, 300),
      search: '',
      showSearchTooltip: false,
      expandedType: null
    }
  },

  computed: {
    ...mapState('Einbox', [
      'inboxes',
      'activeInboxId',
      'isLoadingInboxes',
      'showRefreshInboxesButton'
    ]),

    ...mapState('auth', ['profile']),

    ...mapState(['isMobile']),

    personalInboxes () {
      return this.inboxes.filter(inbox => inbox.is_personal)
    },

    connectedInboxes () {
      return this.inboxes.filter(inbox => inbox.is_connected)
    },

    watchingInboxes () {
      return this.inboxes.filter(inbox => inbox.is_watching)
    },

    typedInboxes () {
      return [
        {
          id: INBOX_TYPE_PERSONAL,
          name: 'Personal Inboxes',
          inboxes: this.personalInboxes
        },
        {
          id: INBOX_TYPE_CONNECTED,
          name: 'Connected Inboxes',
          inboxes: this.connectedInboxes
        },
        {
          id: INBOX_TYPE_WATCHING,
          name: 'Watching Inboxes',
          inboxes: this.watchingInboxes
        }
      ]
    }
  },

  methods: {
    ...mapActions('Einbox', [
      'setActiveInboxId',
      'setActiveInbox',
      'resetInboxes',
      'resetItems',
      'setInboxes'
    ]),

    onToggleExpanded (type) {
      if (this.expandedType === type) {
        this.expandedType = null
        return
      }

      this.expandedType = type
    },

    onInboxSelect (inboxId, contactId = null) {
      if (inboxId === this.activeInboxId) {
        return
      }

      // checks if user has access to the inbox
      if (!this.checkInboxAccess(inboxId)) {
        this.$generalNotification('You don\'t have access to this inbox.', 'error')
        this.$router.push({ name: EINBOXES_MENU_TITLE })

        return
      }

      this.setActiveInboxId(parseInt(inboxId))
      this.resetItems()
      this.fetchItems(inboxId)

      const route = `/team-inboxes/${inboxId}` + (contactId ? `/contacts/${contactId}/communications` : '')

      // avoid redundant navigation
      if (this.$route.path !== route) {
        this.$router.push(route)
      }
    },

    onSearch (search) {
      this.search = search
    },

    onRefreshInboxes () {
      this.fetchInboxes(this.search)
    },

    onLoadMore (type) {
      this.loadMoreInboxes(type, this.search)
    },

    orderInboxes () {
      const sortedInboxes = [...this.inboxes].sort((a, b) => a.name.localeCompare(b.name))
      this.setInboxes({ data: sortedInboxes })
    },

    checkAndRedirectActiveInbox (ringGroup) {
      const inboxId = this.$route.params.inboxId
        ? parseInt(this.$route.params.inboxId)
        : (!this.isMobile ? this.inboxes[0]?.id : null)

      if (inboxId && inboxId === ringGroup.id) {
        this.$router.push({ name: EINBOXES_MENU_TITLE })
      }
    },

    newRingGroupListener (ringGroup) {
      if (ringGroup.all_user_ids?.includes(this.profile.id)) {
        const updatedInboxes = [...this.inboxes, ringGroup]
        this.setInboxes({ data: updatedInboxes })
        this.orderInboxes()
      }
    },

    updateRingGroupListener (ringGroup) {
      if (ringGroup.all_user_ids?.includes(this.profile.id)) {
        const index = this.inboxes.findIndex(inbox => inbox.id === ringGroup.id)
        const updatedInboxes = [...this.inboxes]

        if (index !== -1) {
          updatedInboxes[index] = ringGroup
        } else {
          updatedInboxes.push(ringGroup)
        }

        this.setInboxes({ data: updatedInboxes })
        this.orderInboxes()
      } else {
        const index = this.inboxes.findIndex(inbox => inbox.id === ringGroup.id)
        if (index !== -1) {
          const updatedInboxes = this.inboxes.filter(inbox => inbox.id !== ringGroup.id)
          this.setInboxes({ data: updatedInboxes })
          this.checkAndRedirectActiveInbox(ringGroup)
        }
      }
    },

    deleteRingGroupListener (ringGroup) {
      const index = this.inboxes.findIndex(inbox => inbox.id === ringGroup.id)
      if (index !== -1) {
        const updatedInboxes = this.inboxes.filter(inbox => inbox.id !== ringGroup.id)
        this.setInboxes({ data: updatedInboxes })
        this.checkAndRedirectActiveInbox(ringGroup)
      }
    }
  },

  async created () {
    await this.fetchInboxes()

    if (this.inboxes.length) {
      // If there are inboxes:
      // - try to get id from route
      // - otherwise set the first inbox as active, if not mobile
      const inboxId = this.$route.params.inboxId ? parseInt(this.$route.params.inboxId) : (!this.isMobile ? this.inboxes[0].id : null)
      const contactId = this.$route.params.id && inboxId ? parseInt(this.$route.params.id) : null

      if (inboxId) {
        this.onInboxSelect(inboxId, contactId)
      }
    }

    // Listen to ring group events
    this.$VueEvent.listen('ring_group_created', this.newRingGroupListener)
    this.$VueEvent.listen('ring_group_updated', this.updateRingGroupListener)
    this.$VueEvent.listen('ring_group_deleted', this.deleteRingGroupListener)
  },

  watch: {
    '$route.params.inboxId' (inboxId) {
      if (!inboxId && this.inboxes.length && !this.isMobile) {
        this.onInboxSelect(this.inboxes[0].id) // use the same behavior as created method
      }
    },

    '$route.name' (route) {
      // reset active inbox id when this page is opened
      if (this.isMobile && route === EINBOXES_MENU_TITLE) {
        this.setActiveInboxId(null)
      }
    },

    search (val) {
      this.resetInboxes()
      this.fetchInboxes(val)
    }
  },

  beforeDestroy () {
    this.setActiveInboxId(null)
    this.setActiveInbox({})

    this.$VueEvent.stop('ring_group_created', this.newRingGroupListener)
    this.$VueEvent.stop('ring_group_updated', this.updateRingGroupListener)
    this.$VueEvent.stop('ring_group_deleted', this.deleteRingGroupListener)
  }
}
</script>

<style lang="scss">
.einbox-nav-list {
  height: 100%;
  background-color: #fff;
  color: #000;
  padding: 7px;

  &__header {
    width: 100%;
    height: 45px;

    &__search {
      label {
        border: none;
      }
    }
  }

  &__content {
    height: calc(100% - 45px);
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 10px 0px 10px 10px;

    &--no-gap {
      row-gap: 0;
    }
  }
}
</style>
