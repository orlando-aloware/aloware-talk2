<template>
  <div class="wallboard__body">
    <div :class="['overview', `overview--${viewMode}`]">
      <wallboard-overview-header />
      <div class="overview__body">
        <wallboard-overview-card :value="item.value"
                                 :description="item.name"
                                 :icon="item.icon"
                                 :filter="item.filter"
                                 :loading="isSummaryLoading"
                                 :key="index"
                                 v-for="(item, index) in items"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import WallboardOverviewHeader from 'src/components/wallboard/wallboard-overview-header.vue'
import WallboardOverviewCard from 'src/components/wallboard/wallboard-overview-card.vue'

export default {
  name: 'WallboardOverview',

  components: {
    WallboardOverviewCard,
    WallboardOverviewHeader
  },

  computed: {
    ...mapState('wallboard', [
      'isSummaryLoading',
      'isOverviewDetailed'
    ]),

    ...mapGetters('wallboard', {
      summary: 'getSummary',
      viewMode: 'getViewMode'
    }),

    items () {
      return [
        {
          name: 'Total Calls',
          value: this.summary.totalCalls,
          icon: 'wallboard-overview-total-calls-icon'
        },
        {
          name: 'Answered Calls',
          value: this.summary.answeredCalls,
          icon: 'wallboard-overview-answered-calls-icon'
        },
        {
          name: 'Missed Calls',
          value: this.summary.missedCalls,
          icon: 'wallboard-overview-missed-calls-icon'
        },
        {
          name: 'Abandoned Calls',
          value: this.summary.abandonedCalls,
          icon: 'wallboard-overview-abandoned-calls-icon'
        },
        {
          name: 'Average Talk Time',
          value: this.summary.averageTalkTime,
          icon: 'wallboard-overview-average-talk-time-icon',
          filter: 'fullDuration'
        },
        {
          name: 'Average Wait Time',
          value: this.summary.averageWaitTime,
          icon: 'wallboard-overview-average-wait-time-icon',
          filter: 'fullDuration'
        },
        {
          name: 'Total Occupancy',
          value: this.summary.totalOccupancy,
          icon: 'wallboard-overview-total-occupancy-icon',
          filter: 'fullDuration'
        },
        {
          name: 'Appointments Set',
          value: this.summary.appointmentsSet,
          icon: 'wallboard-overview-appointments-set-icon'
        },
        {
          name: 'Reminders Set',
          value: this.summary.remindersSet,
          icon: 'wallboard-overview-reminders-set-icon'
        },
        {
          name: 'Emails Sent',
          value: this.summary.emailsSent,
          icon: 'wallboard-overview-emails-sent-icon',
          enabled: this.isOverviewDetailed
        },
        {
          name: 'Emails Received',
          value: this.summary.emailsReceived,
          icon: 'wallboard-overview-emails-received-icon',
          enabled: this.isOverviewDetailed
        },
        {
          name: 'Texts Received',
          value: this.summary.textsReceived,
          icon: 'wallboard-overview-texts-received-icon'
        },
        {
          name: 'Faxes Sent',
          value: this.summary.faxesSent,
          icon: 'wallboard-overview-faxes-sent-icon',
          enabled: this.isOverviewDetailed
        },
        {
          name: 'Faxes Received',
          value: this.summary.faxesReceived,
          icon: 'wallboard-overview-faxes-received-icon',
          enabled: this.isOverviewDetailed
        },
        {
          name: 'Texts Sent',
          value: this.summary.textsSent,
          icon: 'wallboard-overview-texts-sent-icon'
        }
      ].filter(item => item.enabled || item.enabled === undefined)
    }
  }
}
</script>
