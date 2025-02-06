<template>
  <div
    class="einbox-nav-list"
    data-testid="einbox-nav-list"
  >
    <q-scroll-area
      ref="scrollArea"
      class="einbox-nav-list__scroll"
      :thumb-style="{ right: '2px', width: '4px', opacity: 0.6 }"
      @scroll="onScroll"
    >
      <einbox-nav-item
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
          data-testid="einbox-nav-list-overlay"
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
import EinboxNavItem from './einbox-nav-item.vue'
// import talk2Api from 'src/plugins/api/api'
// import { EinboxMixin } from 'src/plugins/mixins'
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
export default {
  name: 'EinboxNavList',

  components: {
    EinboxNavItem
  },

  mixins: [EinboxMixin],

  data () {
    return {
      // loading: false,
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
    // ...mapGetters('Einbox', ['getInboxesFirstPage'])

    /*
      inboxes () {
      return this.getInboxesFirstPage
    } */
  },

  methods: {
    ...mapActions('Einbox', [
      'setActiveInbox',
      'resetCommunications'
    ]),

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
      this.resetCommunications()
      console.log('getting communications from: ', inboxId)
      this.fetchCommunications(inboxId)
      this.$router.push(`/einbox/${inboxId}`)
    }
  },

  async created () {
    await this.fetchInboxes()

    // If there are inboxes, set the first one as active
    if (this.inboxes.length) {
      const inboxId = this.inboxes[0].id
      this.setActiveInbox(inboxId)
      this.resetCommunications()
      console.log('getting communications from: ', inboxId)
      this.fetchCommunications(inboxId)
    }
  }
}
</script>

<style lang="scss" scoped>
.einbox-nav-list {
  height: 100%;
  background-color: #F4F4F6;
  border-right: 1px solid #e0e0e0;

  &__scroll {
    height: 100%;
  }
}
</style>
