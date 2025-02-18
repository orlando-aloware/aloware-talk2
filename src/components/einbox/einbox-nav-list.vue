<template>
  <div class="einbox-nav-list"
       data-testid="einbox-nav-list">
    <q-scroll-area ref="scrollArea"
                   class="einbox-nav-list__scroll"
                   :thumb-style="{ right: '2px', width: '4px', opacity: 0.6 }"
                   @scroll="onScroll">
      <einbox-nav-item :label="inbox.name"
                       :value="inbox.id"
                       :message-count="inbox.message_count"
                       :is-active="activeInbox === inbox.id"
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
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import EinboxNavItem from './einbox-nav-item.vue'
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
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
      hasMorePages: true
    }
  },

  computed: {
    ...mapState('Einbox', [
      'inboxes',
      'activeInbox',
      'isLoadingInboxes'
    ])
  },

  methods: {
    ...mapActions('Einbox', [
      'setActiveInbox',
      'resetItems'
    ]),

    onScroll ({ verticalPosition, verticalSize, verticalContainerSize }) {
      const bottomThreshold = 100
      const isNearBottom =
        verticalPosition + verticalContainerSize + bottomThreshold >= verticalSize

      if (isNearBottom && !this.loading && this.hasMorePages) {
      }
    },

    onInboxSelect (inboxId) {
      // avoid redundant navigation
      if (inboxId === this.activeInbox) {
        return
      }

      this.setActiveInbox(inboxId)
      this.resetItems()
      this.fetchItems(inboxId)
      this.$router.push(`/einbox/${inboxId}`)
    }
  },

  async created () {
    await this.fetchInboxes()

    // If there are inboxes, set the first one as active
    if (this.inboxes.length) {
      const inboxId = this.inboxes[0].id
      this.setActiveInbox(inboxId)
      this.resetItems()
      this.fetchItems(inboxId)
    }
  }
}
</script>

<style lang="scss" scoped>
.einbox-nav-list {
  height: 100%;
  background-color: #fff;
  color: #000;
  padding: 7px;

  &__scroll {
    height: 100%;
  }
}
</style>
