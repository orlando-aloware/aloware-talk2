<template>
  <component class="overview__body__card"
             :is="getComponent"
             v-bind="getComponentProps">
    <div class="overview__body__card__container">
      <div class="overview__body__card__container__icon">
        <component :is="icon"/>
      </div>
      <div class="overview__body__card__container__body">
        <div class="overview__body__card__container__body__value">
          <q-skeleton type="text"
                      animation="fade"
                      height="26px"
                      width="100px"
                      v-if="loading" />
          <counter-up :startVal="countUp.startVal"
                      :endVal="value"
                      :duration="countUp.duration"
                      :options="countUp.options"
                      v-else-if="!filter" />
          <span v-else>
            {{ getValue }}
          </span>
        </div>
        <div class="overview__body__card__container__body__description">
          {{ description }}
        </div>
      </div>
    </div>
  </component>
</template>

<script>
import CounterUp from 'vue-countup-v2'
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
  name: 'wallboard-overview-card',

  components: {
    CounterUp,
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
    },

    filter: {
      type: String,
      required: false
    },

    loading: {
      type: Boolean,
      default: false
    },

    route: {
      type: String,
      required: false
    }
  },

  computed: {
    getComponent () {
      switch (true) {
        case !!this.route:
          return 'router-link'
        default:
          return 'div'
      }
    },

    getComponentProps () {
      if (!this.route) {
        return null
      }

      return {
        to: {
          path: this.route
        }
      }
    },

    getValue () {
      return this.filter
        ? this.$options.filters[this.filter](this.value)
        : this.value
    }
  },

  data () {
    return {
      countUp: {
        startVal: 0,
        duration: 2.5,
        options: {
          useEasing: true,
          useGrouping: true,
          easingFn: (t, b, c, d) => {
            let ts = (t /= d) * t
            let tc = ts * t
            return b + c * (tc + -3 * ts + 3 * t)
          }
        }
      }
    }
  }
}
</script>
