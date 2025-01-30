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
        :label="inbox.name"
        :value="inbox.id"
        :message-count="inbox.message_count"
        :is-active="activeInbox === inbox.id"
        v-for="inbox in inboxes"
        :key="inbox.id"
        @click="onInboxSelect"
      />

      <div
        v-if="isLoadingInboxes"
        :class="[isLoadingInboxes ? 'py-5' : 'py-4', 'relative']"
      >
        <b-overlay
          :show="isLoadingInboxes"
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
import { mapState, mapActions } from 'vuex'
import InboxNewNavItem from './inbox-new-nav-item'
// import talk2Api from 'src/plugins/api/api'
// import { eInboxMixin } from 'src/plugins/mixins'
import eInboxMixin from 'src/plugins/mixins/e-inbox.mixin'
export default {
  name: 'InboxNewNavList',

  components: {
    InboxNewNavItem
  },

  mixins: [eInboxMixin],

  data () {
    return {
      // loading: false,
      currentPage: 0,
      perPage: 50,
      hasMorePages: true
    }
  },

  computed: {
    ...mapState('eInbox', [
      'inboxes',
      'activeInbox',
      'isLoadingInboxes'
    ])
    // ...mapGetters('eInbox', ['getInboxesFirstPage'])

    /*
      inboxes () {
      return this.getInboxesFirstPage
    } */
  },

  methods: {
    ...mapActions('eInbox', ['setActiveInbox']),

    onScroll ({ verticalPosition, verticalSize, verticalContainerSize }) {
      const bottomThreshold = 100
      const isNearBottom =
        verticalPosition + verticalContainerSize + bottomThreshold >= verticalSize

      if (isNearBottom && !this.loading && this.hasMorePages) {
        /* moved this to the mixin, need implement and test  */
        /* this.loadMoreInboxes() */
      }
    },

    onInboxSelect (inboxId) {
      this.setActiveInbox(inboxId)
      // this.resetCommunications()
    }
  },

  async created () {
    await this.fetchInboxes()

    // If there are inboxes, set the first one as active
    if (this.inboxes.length) {
      this.setActiveInbox(this.inboxes[0].id)
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
