<template>
  <div class="overview__card">
    <div class="overview__card__icon">
      <component :is="icon"/>
    </div>
    <div class="overview__card__body">
      <div class="overview__card__body__value">
        {{ value }}
      </div>
      <div class="overview__card__body__description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script>
import WallboardOverviewAbandonedCallsIcon from 'src/components/icons/wallboard/overview-abandoned-calls-icon'
import WallboardOverviewAnsweredCallsIcon from 'src/components/icons/wallboard/overview-answered-calls-icon'
import WallboardOverviewAppointmentsSetIcon from 'src/components/icons/wallboard/overview-appointments-set-icon'
import WallboardOverviewAverageTalkTimeIcon from 'src/components/icons/wallboard/overview-average-talk-time-icon'
import WallboardOverviewAverageWaitTimeIcon from 'src/components/icons/wallboard/overview-average-wait-time-icon'
import WallboardOverviewEmailsReceivedIcon from 'src/components/icons/wallboard/overview-emails-received-icon'
import WallboardOverviewEmailsSentIcon from 'src/components/icons/wallboard/overview-emails-sent-icon'
import WallboardOverviewFaxesReceivedIcon from 'src/components/icons/wallboard/overview-faxes-received-icon'
import WallboardOverviewFaxesSentIcon from 'src/components/icons/wallboard/overview-faxes-sent-icon'
import WallboardOverviewMissedCallsIcon from 'src/components/icons/wallboard/overview-missed-calls-icon'
import WallboardOverviewRemindersSetIcon from 'src/components/icons/wallboard/overview-reminders-set-icon'
import WallboardOverviewTextsReceivedIcon from 'src/components/icons/wallboard/overview-texts-received-icon'
import WallboardOverviewTextsSentIcon from 'src/components/icons/wallboard/overview-texts-sent-icon'
import WallboardOverviewTotalCallsIcon from 'src/components/icons/wallboard/overview-total-calls-icon'
import WallboardOverviewTotalOccupancyIcon from 'src/components/icons/wallboard/overview-total-occupancy-icon'

export default {
  name: 'WallboardOverviewCard',

  components: {
    WallboardOverviewAbandonedCallsIcon,
    WallboardOverviewAnsweredCallsIcon,
    WallboardOverviewAppointmentsSetIcon,
    WallboardOverviewAverageTalkTimeIcon,
    WallboardOverviewAverageWaitTimeIcon,
    WallboardOverviewEmailsReceivedIcon,
    WallboardOverviewEmailsSentIcon,
    WallboardOverviewFaxesReceivedIcon,
    WallboardOverviewFaxesSentIcon,
    WallboardOverviewMissedCallsIcon,
    WallboardOverviewRemindersSetIcon,
    WallboardOverviewTextsReceivedIcon,
    WallboardOverviewTextsSentIcon,
    WallboardOverviewTotalCallsIcon,
    WallboardOverviewTotalOccupancyIcon
  },

  props: {
    value: {
      type: [Number, String],
      required: true
    },

    description: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      required: true
    }
  }
}
</script>
