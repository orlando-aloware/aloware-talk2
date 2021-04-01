<template>
  <div class="h-100 py-2">
    <div class="row mx-0"
         :style="'width: ' + width">
      <div class="col-auto p-0 text-center">
        <round-bg-icon>
          <message-icon width="14"
                        height="14"
                        iconColor="white" />
        </round-bg-icon>
      </div>
      <div class="col-8 px-2 text-left">
        <div class="w-100">
          <inbox-item-name :contact="contact"/>
        </div>
        <span v-if="contact.last_engagement_text"
              class="message">
          {{ contact.last_engagement_text | truncate(100) }}
        </span>
      </div>
      <div v-if="contact.last_engagement_at"
           class="time-since col-2 pl-2 pr-0 text-right">
        <relative-time :fromTime="contact.last_engagement_at"
                       :humanized="true"></relative-time>
      </div>
    </div>
  </div>
</template>

<script>
import MessageIcon from '../../icons/message-icon.vue'
import RoundBgIcon from '../../icons/round-bg-icon'
import * as CommunicationTypes from '../../../constants/communication-types'
import RelativeTime from 'components/commons/relative-time'
import InboxItemName from 'components/inbox/inbox-list/inbox-item-name'
export default {
  name: 'inbox-item',
  props: {
    contact: {
      required: true,
      default: {}
    },
    width: {
      required: false,
      type: String,
      default: '100%'
    },
    border: {
      required: false,
      default: false
    },
    rounded: {
      required: false,
      default: false
    }
  },

  components: {
    InboxItemName,
    RelativeTime,
    MessageIcon,
    RoundBgIcon
  },

  data () {
    return {
      icon: '',
      CommunicationTypes
    }
  }
}
</script>

<style lang="scss">
.icon {
  width: 30px;
  height: 30px;
}
.message {
  color: #202125;
  font-family: Roboto;
  font-size: 13px;
  letter-spacing: 0;
  line-height: 18px;
}
.time-since {
  color: var(grey-mid);
  font-family: Roboto;
  font-size: 12px;
  letter-spacing: 0;
  line-height: 16px;
}
</style>
