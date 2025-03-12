<template>
  <div class="einbox-nav-list"
       data-testid="einbox-nav-list">
    <div class="einbox-nav-list__header border-bottom">
      <search class="einbox-nav-list__header__search"
              placeholder="Search Inboxes"
              data-testid="einbox-search"
              @search="onSearch"/>
    </div>
    <div class="einbox-nav-list__scroll blue-scroll"
         @scroll="onScroll">
      <einbox-nav-item :label="inbox.name"
                       :value="inbox.id"
                       :message-count="inbox.message_count"
                       :is-active="activeInboxId === inbox.id"
                       :key="inbox.id"
                       v-for="inbox in inboxes"
                       @click="onInboxSelect" />

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
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import EinboxNavItem from './einbox-nav-item.vue'
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
import Search from 'src/components/search.vue'
import { debounce } from 'lodash'

export default {
  components: {
    EinboxNavItem,
    Search
  },

  mixins: [
    EinboxMixin
  ],

  data () {
    return {
      perPage: 50,
      hasMorePages: true,
      loadMoreInboxesDebounced: debounce(this.loadMoreInboxes, 300),
      search: ''
    }
  },

  computed: {
    ...mapState('Einbox', [
      'inboxes',
      'activeInboxId',
      'isLoadingInboxes'
    ]),

    ...mapState(['isMobile'])
  },

  methods: {
    ...mapActions('Einbox', [
      'setActiveInboxId',
      'setActiveInbox',
      'resetInboxes',
      'resetItems'
    ]),

    onScroll ({ verticalPosition, verticalSize, verticalContainerSize }) {
      const bottomThreshold = 100
      const isNearBottom = verticalPosition + verticalContainerSize + bottomThreshold >= verticalSize

      if (isNearBottom && !this.loading && this.hasMorePages) {
        this.loadMoreInboxesDebounced()
      }
    },

    onInboxSelect (inboxId, contactId = null) {
      if (inboxId === this.activeInboxId) {
        return
      }

      this.setActiveInboxId(parseInt(inboxId))
      this.resetItems()
      this.fetchItems(inboxId)

      const route = `/einbox/${inboxId}` + (contactId ? `/contacts/${contactId}/communications` : '')

      // avoid redundant navigation
      if (this.$route.path !== route) {
        this.$router.push(route)
      }
    },

    onSearch (search) {
      this.search = search
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
  },

  watch: {
    '$route.params.inboxId' (inboxId) {
      if (!inboxId && this.inboxes.length && !this.isMobile) {
        this.onInboxSelect(this.inboxes[0].id) // use the same behavior as created method
      }
    },

    '$route.name' (route) {
      // reset active inbox id when this page is opened
      if (this.isMobile && route === 'EInbox') {
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
  }
}
</script>

<style lang="scss">
.einbox-nav-list {
  height: 100%;
  background-color: #fff;
  color: #000;

  &__header {
    width: 100%;
    height: 45px;

    &__search {
      padding: 5px 0px;

      label {
        border: none;
      }
    }
  }

  &__scroll {
    height: 100%;
    padding: 7px;
    overflow-y: auto;
  }
}
</style>
