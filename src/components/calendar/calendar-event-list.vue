<template>
  <q-dialog content-class="calendar-event-list-modal"
            :full-width="isMobile"
            :full-height="isMobile"
            :maximized="isMobile"
            :style="isMobile ? 'width: 100%' : 'width: 1000px'"
            v-model="dialogOpen">
    <q-card style="border-radius: 10px">
      <q-card-section class="d-flex align-items-center justify-between">
        <div class="calendar-event-list-modal-title">{{ modalTitle }}</div>
        <q-btn icon="close"
               size="12px"
               flat
               round
               dense
               v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section class="pb-0"
                      v-if="displayedEvents.length || searchQuery">
        <search class="w-100"
                placeholder="Search by name"
                data-testid="calendar-event-list-search-input"
                @search="onSearch">
        </search>
      </q-card-section>
      <q-card-section class="scroll"
                      :class="isMobile ? 'p-0' : 'q-mb-lg'"
                      :style="isMobile ? 'max-height: 92vh' : 'max-height: 50vh'">
        <div v-if="displayedEvents.length">
          <div class="q-mb-sm"
               :class="{ 'mb-0': index === displayedEvents.length - 1 }"
               :key="event.id"
               v-for="(event, index) in displayedEvents"
               @click="openEventModal(event)">
            <div class="row no-wrap items-center cursor-pointer">
              <div class="col-auto">
                <div class="dhx_cal_event_clear dhx_cal_event_line_start dhx_cal_event_line_end rounded-circle-dot"
                     :class="getEventClass(event)">
                  <span></span>
                </div>
              </div>
              <div class="col">
                <div :class="getCancelledEventTextDecoration(event)"
                     v-if="timezoneIsDifferentThanBrowser && !isMobile">
                  <div v-html="formatEventTime(event)"></div>
                  <div>{{ getEventStatusLabel(event?.status) }} {{ getEventTypeLabel(event?.type) }}</div>
                </div>
                <div :class="getCancelledEventTextDecoration(event)"
                     v-else>
                  {{ formatEventTime(event) }} - {{ getEventStatusLabel(event?.status) }} {{ getEventTypeLabel(event?.type) }}
                </div>
                <div class="text-bold"
                     :class="getCancelledEventTextDecoration(event)">
                  {{ event.text }}
                </div>
              </div>
            </div>
            <q-separator spaced
                         v-if="index !== displayedEvents.length - 1" />
          </div>
        </div>
        <div v-else>
          <p class="text-caption">{{ emptyEventsMessage }}</p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import moment from 'moment'
import Search from 'src/components/search.vue'
import { calendarMixin } from 'src/plugins/mixins'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'calendar-event-list',

  mixins: [calendarMixin],

  components: {
    Search
  },

  props: {
    isMobile: {
      type: Boolean,
      default: false
    },
    eventsModalMode: {
      type: String,
      default: 'hour'
    },
    viewMode: {
      type: String,
      default: 'day'
    },
    currentDate: {
      type: [Date, String, Object],
      default: () => moment()
    },
    selectedDate: {
      type: [Date, String, Object],
      required: true
    },
    selectedHour: {
      type: [Date, String, Object],
      required: true
    },
    events: {
      type: Array,
      default: () => []
    },
    value: { // For v-model binding
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      searchQuery: '',
      CommunicationDispositionStatus
    }
  },

  computed: {
    dialogOpen: {
      get () {
        return this.value
      },

      set (value) {
        this.$emit('input', value)
      }
    },

    eventsForSelectedHour () {
      if (this.viewMode === 'week') {
        const startOfWeek = moment(this.currentDate.split(' - ')[0], 'D MMM YYYY')
        const endOfWeek = moment(this.currentDate.split(' - ')[1], 'D MMM YYYY')

        return this.events.filter(event => {
          const eventStart = moment(event.start_date)
          const selectedHour = moment(this.selectedHour)

          const matchesSearch = event?.text?.toLowerCase()?.includes(this.searchQuery.toLowerCase())

          return eventStart.isBetween(startOfWeek, endOfWeek, null, '[]') &&
            eventStart.hour() === selectedHour.hour() &&
            matchesSearch
        }).sort(this.sortListEvents)
      }

      return this.events.filter(event => {
        const eventStart = moment(event.start_date)
        const eventEnd = moment(event.end_date)
        const selectedHour = moment(this.selectedHour)

        const matchesSearch = event?.text?.toLowerCase()?.includes(this.searchQuery.toLowerCase())

        return (eventStart.isSame(selectedHour, 'hour') || (eventStart.isBefore(selectedHour) &&
          eventEnd.isAfter(selectedHour))) &&
          matchesSearch
      }).sort(this.sortListEvents)
    },

    eventsForSelectedDate () {
      if (this.viewMode === 'week') {
        const startOfWeek = moment(this.currentDate.split(' - ')[0], 'D MMM YYYY')
        const endOfWeek = moment(this.currentDate.split(' - ')[1], 'D MMM YYYY')

        return this.events.filter(event => {
          const eventStart = moment(event.start_date)
          const matchesSearch = event?.text?.toLowerCase()?.includes(this.searchQuery.toLowerCase())

          return eventStart.isBetween(startOfWeek, endOfWeek, null, '[]') &&
            matchesSearch
        }).sort(this.sortListEvents)
      }

      const selectedDay = moment(this.selectedDate).startOf('day')

      return this.events.filter(event => {
        const eventDate = moment(event.start_date)
        const matchesSearch = event?.text?.toLowerCase()?.includes(this.searchQuery.toLowerCase())

        return eventDate.isSame(selectedDay, 'day') && matchesSearch
      })
    },

    displayedEvents () {
      return this.eventsModalMode === 'hour'
        ? this.eventsForSelectedHour
        : this.eventsForSelectedDate
    },

    modalTitle () {
      const {
        currentTime,
        currentTimeAcronym,
        localTime,
        localTimeAcronym
      } = this.getFormattedTime(this.selectedHour, this.listViewTimeFormat)

      if (this.viewMode === 'week') {
        return this.getWeekViewModalTitle(currentTime, currentTimeAcronym, localTime, localTimeAcronym)
      }

      if (this.eventsModalMode === 'hour') {
        return this.getHourViewModalTitle(currentTime, currentTimeAcronym, localTime, localTimeAcronym)
      }

      return `Showing events for ${moment(this.selectedDate).format('LL')}`
    },

    emptyEventsMessage () {
      if (this.searchQuery) {
        return 'No events found for this search.'
      }

      if (this.viewMode === 'week') {
        return `There are no events for the week between ${this.currentDate.split(' - ')[0]} and ${this.currentDate.split(' - ')[1]}.`
      }

      return `There are no events for this ${this.eventsModalMode === 'hour' ? 'hour' : 'day'}.`
    }
  },

  methods: {
    formatEventTime (event) {
      const {
        currentStartDate,
        currentStartTime,
        currentEndDate,
        currentEndTime,
        currentTimeAcronym,
        localStartDate,
        localStartTime,
        localEndDate,
        localEndTime,
        localTimeAcronym
      } = this.getStartEndTime({
        currentStart: event.start_date,
        currentEnd: event.end_date,
        browserStart: event.start_date,
        browserEnd: event.end_date
      })

      if (this.viewMode === 'week') {
        if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
          return `<strong>${currentStartDate} - ${currentStartTime}</strong> - <strong>${currentEndDate} - ${currentEndTime}</strong> ${currentTimeAcronym} / <strong>${localStartDate} - ${localStartTime}</strong> - <strong>${localEndDate} - ${localEndTime}</strong> ${localTimeAcronym}`
        }

        return `${localStartDate} - ${localStartTime} - ${localEndDate} - ${localEndTime}`
      }

      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        return `${currentStartTime} - ${currentEndTime} ${currentTimeAcronym} / ${localStartTime} - ${localEndTime} ${localTimeAcronym}`
      }

      return `${localStartTime} - ${localEndTime}`
    },

    openEventModal (event) {
      this.$emit('open-event-modal', event)
    },

    getEventClass (event) {
      const isPast = event.is_past
      return `event-bg-color-type-${event.type} status-${event.status} ${isPast ? 'is_past' : ''}`
    },

    getCancelledEventTextDecoration (event) {
      return event.status === 10 ? 'text-strike' : 'none'
    },

    getEventStatusLabel (status) {
      switch (status) {
        case CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW:
        case CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED:
          return 'Completed'
        case CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW:
        case CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED:
          return 'Canceled'
        case CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_MISSED:
        case CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW:
          return 'Missed'
        default:
          return ''
      }
    },

    getEventTypeLabel (type) {
      switch (type) {
        case CommunicationTypes.REMINDER:
          return 'Reminder'
        default:
          return 'Appointment'
      }
    },

    getWeekViewModalTitle (currentTime, currentTimeAcronym, localTime, localTimeAcronym) {
      const startOfWeek = this.currentDate.split(' - ')[0]
      const endOfWeek = this.currentDate.split(' - ')[1]

      if (this.eventsModalMode === 'hour') {
        if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
          const currentHour = currentTime?.split(' ')[3]
          const currentMinutes = currentTime?.split(' ')[4]
          const localHour = localTime?.split(' ')[3]
          const localMinutes = localTime?.split(' ')[4]

          return `Showing events for ${currentHour} ${currentMinutes} ${currentTimeAcronym} / ${localHour} ${localMinutes} ${localTimeAcronym} for the week between ${startOfWeek} and ${endOfWeek}`
        }

        const localTimeHour = `${localTime?.split(' ')[3]} ${localTime?.split(' ')[4]}`
        return `Showing events for ${localTimeHour} for the week between ${startOfWeek} and ${endOfWeek}`
      }

      return `Showing events for the week between ${startOfWeek} and ${endOfWeek}`
    },

    getHourViewModalTitle (currentTime, currentTimeAcronym, localTime, localTimeAcronym) {
      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        return `Showing events for ${currentTime} ${currentTimeAcronym} / ${localTime} ${localTimeAcronym}`
      }

      return `Showing events for ${localTime}`
    },

    sortListEvents (a, b) {
      const startDiff = moment(a.start_date).diff(moment(b.start_date))
      const durationDiff = moment(a.end_date).diff(a.start_date) - moment(b.end_date).diff(b.start_date)
      return startDiff !== 0 ? startDiff : durationDiff
    },

    onSearch (searchQuery) {
      this.searchQuery = searchQuery
    }
  },

  watch: {
    dialogOpen (newVal) {
      if (newVal) {
        this.searchQuery = ''
      }
    }
  }
}
</script>
