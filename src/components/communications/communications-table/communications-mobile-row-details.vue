<template>
  <div class="mobile-detail-container">
    <div v-for="column in visibleColumns"
         :key="column.name"
         :data-test-id="`mobile-detail-item-column-${column.name}`"
         class="mobile-detail-item">
      <div class="mobile-detail-label">
        {{ column.label }}
      </div>
      <div class="mobile-detail-value">
        <incoming-number v-if="column.name === 'incoming_number'"
                        :row="communication"
                        :campaign-id="communication.campaign_id"
                        @on-filter="$emit('on-filter', $event)" />

        <message-body v-else-if="column.name === 'body'"
                     :communication="communication" />

        <ring-group v-else-if="column.name === 'ring_group'"
                   :row="communication" />

        <start-time v-else-if="column.name === 'created_at'"
                    mobile-row-details
                   :row="communication" />

        <talk-time v-else-if="column.name === 'talk_time'"
                  :row="communication" />

        <wait-time v-else-if="column.name === 'wait_time'"
                  :row="communication" />

        <hold-time v-else-if="column.name === 'hold_time'"
                  :row="communication" />

        <contact v-else-if="column.name === 'contact'"
                :row="communication" />

        <user v-else-if="column.name === 'user_id'"
              :row="communication"
              @on-filter="$emit('on-filter', $event)" />

        <broadcast v-else-if="column.name === 'broadcast'"
                  :value="communication.broadcast_id" />

        <workflow v-else-if="column.name === 'workflow'"
                 :value="communication.workflow_id" />

        <duration v-else-if="column.name === 'duration'"
                 :row="communication" />

        <attempting-users v-else-if="column.name === 'attempting_users'"
                         expand-on-hover
                         :row="communication" />

        <transferred v-else-if="column.name === 'transfer_prior_user_ids'"
                    prop="transfer_prior_user_ids"
                    :row="communication" />

        <transferred v-else-if="column.name === 'transfer_target_user_ids'"
                    prop="transfer_target_user_ids"
                    :row="communication" />

        <span v-else-if="column.name === 'in_cold_transfer'"
              data-testid="cold-transfer-row">
          {{ communication.in_cold_transfer ? 'Yes' : 'No' }}
        </span>

        <transfer-type v-else-if="column.name === 'transfer_type'"
                      :row="communication" />

        <callback-status v-else-if="column.name === 'callback_status'"
                        :row="communication" />

        <queue-resolution v-else-if="column.name === 'queue_resolution2'"
                         :row="communication" />

        <creator-type v-else-if="column.name === 'creator_type'"
                     :row="communication" />

        <communications-tags v-else-if="column.name === 'tags'"
                           :communication="communication" />

        <wallboard-calls-note v-else-if="column.name === 'notes'"
                             ellipse
                             :communication="communication" />

        <csat-score v-else-if="column.name === 'csat_score'"
                   :row="communication" />
      </div>
    </div>
  </div>
</template>

<script>
import IncomingNumber from './incoming-number.vue'
import MessageBody from './message-body.vue'
import RingGroup from './ring-group.vue'
import StartTime from './start-time.vue'
import TalkTime from './talk-time.vue'
import WaitTime from './wait-time.vue'
import HoldTime from './hold-time.vue'
import Contact from './contact.vue'
import User from './user.vue'
import Broadcast from './broadcast.vue'
import Workflow from './workflow.vue'
import Duration from './duration.vue'
import AttemptingUsers from './attempting-users.vue'
import Transferred from './transferred.vue'
import TransferType from './transfer-type.vue'
import CallbackStatus from './callback-status.vue'
import QueueResolution from './queue-resolution.vue'
import CreatorType from './creator-type.vue'
import CsatScore from './csat-score.vue'
import WallboardCallsNote from 'components/wallboard/wallboard-calls-note.vue'
import CommunicationsTags from './communications-tags.vue'
import { isLiveCall } from 'src/plugins/helpers/functions'

export default {
  name: 'CommunicationsMobileRowDetails',

  components: {
    IncomingNumber,
    MessageBody,
    RingGroup,
    StartTime,
    TalkTime,
    WaitTime,
    HoldTime,
    Contact,
    User,
    Broadcast,
    Workflow,
    Duration,
    AttemptingUsers,
    Transferred,
    TransferType,
    CallbackStatus,
    QueueResolution,
    CreatorType,
    CsatScore,
    WallboardCallsNote,
    CommunicationsTags
  },

  props: {
    communication: {
      type: Object,
      required: true
    },
    visibleColumns: {
      type: Array,
      required: true
    }
  },

  methods: {
    isLiveCall
  }
}
</script>

<style lang="scss" scoped>
.mobile-detail-container {
  padding: 5px 8px;
  background: #fff;
  box-shadow: inset 0 -2px 5px #ddd;
  gap: 0.5rem;
  font-size: 0.8rem;

  .mobile-detail-item {
    display: flex;
    flex-direction: column;
    padding: 6px 0;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }

    .mobile-detail-label {
      font-weight: 600;
      color: #6c757d;
      margin-bottom: 4px;
    }

    .mobile-detail-value {
      color: #212529;
    }
  }
}
</style>
