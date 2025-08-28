<template>
  <div class="communication-list">
    <!-- Initial loading state -->
    <div :class="[isLoadingItems ? 'py-5' : 'py-4', 'relative']"
         v-if="isLoadingItems">
      <b-overlay rounded="sm"
                 variant="white"
                 data-testid="items-list-overlay"
                 :show="isLoadingItems">
        <template #overlay>
          <div class="text-center">
            <q-spinner-bars color="primary"
                            size="2em" />
          </div>
        </template>
      </b-overlay>
    </div>

    <!-- Error state -->
    <div class="text-center text-danger py-5" v-else-if="loadError">
      <div class="mb-3">
        <i class="fas fa-exclamation-triangle fa-2x"></i>
      </div>
      <h5>We had a problem loading the inbox</h5>
      <button class="btn btn-sm btn-primary mt-3"
              @click.prevent="onRefresh">
        <refresh-icon color="#fff"/> Reload
      </button>
    </div>

    <!-- items list -->
    <template v-else-if="items.length">
      <div :key="item.id"
           v-for="item in items"
           @click="onItemClick(item)">
        <communication :contact-id="item.contact_id"
                       :contact-name="item.contact?.name"
                       :contact-phone-number="item.contact?.phone_number || item.lead_number"
                       :campaign-id="item.campaign_id"
                       :campaign="item.campaign"
                       :disposition-status="item.disposition_status2"
                       :type="item.type"
                       :direction="item.direction"
                       :callback-status="item.callback_status"
                       :body="getMessageBody(item)"
                       :current-status="item.current_status2"
                       :date="item.created_at"
                       :unread-properties="getUnreadsProperties(item)"
                       :is-active="activeId === (viewMode === THREADED ? item.contact_id : item.id)"
                       :repeats="viewMode === UNTHREADED ? item.repeats : null"
                       :is-live-call="isLiveCall(item)"
                       :team-inbox-id="getTeamInboxIdForCommunication(item)"
                       :from-team-inbox="true"
                       :view-mode="viewMode"
                       :communication-id="item.id"
                       :last_call_source="item.last_call_source"
                       :contact="item.contact"/>
      </div>

      <!-- Load more indicator -->
      <div class="text-center q-pa-sm"
           v-if="isLoadingMoreItems || isLoadingItems">
        <q-spinner-dots color="primary"
                        size="2em" />
      </div>
    </template>

    <!-- Empty state -->
    <div class="text-center text-grey pt-4"
         v-else>
      No communications found in this inbox

      <br/>

      <button class="btn btn-sm btn-primary mt-4"
              v-if="showRefreshCommunicationsButton"
              @click.prevent="onRefresh">
        <refresh-icon color="#fff"/> Reload
      </button>
    </div>
  </div>
</template>

<script>
import Communication from 'src/components/teaminbox/communication-items/communication.vue'
import RefreshIcon from 'src/components/icons/refresh-icon.vue'
import { isLiveCall } from 'src/plugins/helpers/functions'
import * as CommunicationDirections from 'src/constants/communication-direction'
import * as CommunicationTypes from 'src/constants/communication-types'
import { THREADED, UNTHREADED, ALL_INBOXES_ID } from 'src/store/teaminbox/teaminbox.store'
import { mapState } from 'vuex'

export default {
  components: {
    Communication,
    RefreshIcon
  },

  props: {
    items: {
      type: Array,
      required: true
    },
    isLoadingItems: {
      type: Boolean,
      default: false
    },
    isLoadingMoreItems: {
      type: Boolean,
      default: false
    },
    loadError: {
      type: Boolean,
      default: false
    },
    activeId: {
      type: Number,
      default: null
    },
    viewMode: {
      type: Number,
      required: true
    },
    showRefreshCommunicationsButton: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      THREADED,
      UNTHREADED,
      CommunicationDirections,
      CommunicationTypes
    }
  },

  computed: {
    ...mapState('TeamInbox', ['activeInboxId'])
  },

  methods: {
    isLiveCall,

    getTeamInboxIdForCommunication (communication) {
      if (this.activeInboxId === ALL_INBOXES_ID) {
        return communication.ring_group_id
      }

      return this.activeInboxId
    },

    getUnreadsProperties (communication) {
      if (this.viewMode === UNTHREADED) {
        return {
          unread_count: communication.repeats > 0 ? communication.unread_repeats : (!communication.is_read ? 1 : 0)
        }
      }

      return {
        unread_count: communication.inbox_unread_count
      }
    },

    onItemClick (item) {
      this.$emit('item-click', item)
    },

    getMessageBody (item) {
      if (item.body && item.body.trim() !== '') {
        return this.$options.filters.truncate(item.body, 20)
      }

      if (item.attachments?.length > 0) {
        return `${item.direction === CommunicationDirections.INBOUND ? CommunicationDirections.INBOUND_STRING : CommunicationDirections.OUTBOUND_STRING} ${CommunicationTypes.MMS_TYPE}`
      }

      if (item.type === CommunicationTypes.RVM) {
        const direction = item.direction === CommunicationDirections.INBOUND ? CommunicationDirections.INBOUND_STRING : CommunicationDirections.OUTBOUND_STRING
        return `${direction} ${CommunicationTypes.RVM_LABEL}`
      }

      return ''
    },

    onRefresh () {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.communication-list {
  width: 100%;
}
</style>
