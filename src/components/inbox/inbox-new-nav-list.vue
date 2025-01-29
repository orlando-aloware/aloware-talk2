<template>
  <div
    class="inbox-new-nav-list"
    data-testid="inbox-new-nav-list"
  >
    <q-scroll-area
      ref="scrollArea"
      class="inbox-new-nav-list__scroll"
      :thumb-style="{ right: '2px', width: '4px', opacity: 0.6 }"
      @scroll="onScroll"
    >
      <inbox-new-nav-item
        v-for="inbox in inboxes"
        :key="inbox.id"
        :label="inbox.name"
        :value="inbox.id"
        :message-count="inbox.message_count"
        :is-active="selectedInboxId === inbox.id"
        @click="onInboxSelect"
      />

      <div
        v-if="loading"
        :class="[loading ? 'py-5' : 'py-4', 'relative']"
      >
        <b-overlay
          :show="loading"
          rounded="sm"
          variant="white"
          data-testid="inbox-new-nav-list-overlay"
        >
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars
                color="primary"
                size="2em"
              />
            </div>
          </template>
        </b-overlay>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import InboxNewNavItem from './inbox-new-nav-item'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'InboxNewNavList',

  components: {
    InboxNewNavItem
  },

  data () {
    return {
      loading: false,
      currentPage: 0,
      selectedInboxId: null,
      perPage: 50,
      hasMorePages: true
    }
  },

  computed: {
    ...mapState('eInbox', ['inboxesFirstPage']),
    ...mapGetters('eInbox', ['getInboxesFirstPage']),

    inboxes () {
      return this.getInboxesFirstPage
    }
  },

  methods: {
    ...mapActions('eInbox', ['setInboxesFirstPage']),

    async loadMoreInboxes () {
      if (this.loading || !this.hasMorePages) return

      this.loading = true
      try {
        const nextPage = this.currentPage + 1
        const response = await talk2Api.V2.inbox.inboxes.get({
          page: nextPage,
          per_page: this.perPage
        })

        const newInboxes = response.data.data

        if (newInboxes.length) {
          if (nextPage === 1) {
            this.setInboxesFirstPage(newInboxes)
          } else {
            this.setInboxesFirstPage([...this.inboxes, ...newInboxes])
          }
          this.currentPage = nextPage

          this.hasMorePages = newInboxes.length === this.perPage
        } else {
          this.hasMorePages = false
        }
      } catch (error) {
        console.error('Error loading inboxes:', error)
      } finally {
        this.loading = false
      }
    },

    onScroll ({ verticalPosition, verticalSize, verticalContainerSize }) {
      const bottomThreshold = 100
      const isNearBottom =
        verticalPosition + verticalContainerSize + bottomThreshold >= verticalSize

      if (isNearBottom && !this.loading && this.hasMorePages) {
        this.loadMoreInboxes()
      }
    },

    onInboxSelect (inboxId) {
      this.selectedInboxId = inboxId
      this.$emit('inbox-selected', inboxId)
    }
  },

  async created () {
    if (!this.inboxes.length) {
      await this.loadMoreInboxes()
    } else {
      this.currentPage = 1
      this.hasMorePages = this.inboxes.length === this.perPage
    }
  }
}
</script>

<style lang="scss" scoped>
.inbox-new-nav-list {
  height: 100%;
  background-color: white;
  border-right: 1px solid #e0e0e0;

  &__scroll {
    height: 100%;
  }
}
</style>
