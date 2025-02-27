<template>
  <div class="einbox-nav-list"
       data-testid="einbox-nav-list">
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
import { debounce } from 'lodash'

export default {
  components: {
    EinboxNavItem
  },

  mixins: [
    EinboxMixin
  ],

  data () {
    return {
      perPage: 50,
      hasMorePages: true,
      loadMoreInboxesDebounced: debounce(this.loadMoreInboxes, 300)
    }
  },

  computed: {
    ...mapState('Einbox', [
      'inboxes',
      'activeInboxId',
      'isLoadingInboxes'
    ])
  },

  methods: {
    ...mapActions('Einbox', [
      'setActiveInboxId',
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
    }
  },

  async created () {
    await this.fetchInboxes()

    // If there are inboxes, set the first one as active
    if (this.inboxes.length) {
      const inboxId = this.$route.params.inboxId ? parseInt(this.$route.params.inboxId) : this.inboxes[0].id
      const contactId = this.$route.params.id ? parseInt(this.$route.params.id) : null

      this.onInboxSelect(inboxId, contactId)
    }
  },

  watch: {
    '$route.params.inboxId' (inboxId) {
      if (!inboxId && this.inboxes.length) {
        this.onInboxSelect(this.inboxes[0].id) // use the same behavior as created method
      }
    }
  },

  beforeDestroy () {
    this.setActiveInboxId(null)
  }
}
</script>

<style lang="scss" scoped>
.einbox-nav-list {
  height: 100%;
  background-color: #fff;
  color: #000;

  &__scroll {
    height: 100%;
    padding: 7px;
    overflow-y: auto;
  }
}
</style>
