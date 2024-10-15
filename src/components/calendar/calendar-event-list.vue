<template>
  <q-dialog :full-width="isMobile"
            :full-height="isMobile"
            :maximized="isMobile"
            v-model="dialogOpen">
    <q-card style="width: 635px; border-radius: 10px">
      <q-card-section class="d-flex align-items-center justify-between">
        <div class="text-h6">{{ modalTitle }}</div>
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
                <div>
                  <span :class="getCancelledEventTextDecoration(event)">
                    {{ formatEventTime(event) }} - {{ getEventStatusLabel(event?.status) }} {{ getEventTypeLabel(event?.type) }}
                  </span>
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
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'calendar-event-list',

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
    timeFormat: {
      type: Number,
      default: 1
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
      return this.eventsModalMode === 'hour'
        ? `Events for ${moment(this.selectedHour).format(this.timeFormat === 1 ? 'D MMM YYYY, h A' : 'D MMM YYYY, H:mm')}`
        : `Events for ${moment(this.selectedDate).format('LL')}`
    },

    emptyEventsMessage () {
      if (this.searchQuery) {
        return 'No events found for this search.'
      }

      return `There are no events for this ${this.eventsModalMode === 'hour' ? 'hour' : 'day'}.`
    }
  },

  methods: {
    formatEventTime (event) {
      const formatString = this.timeFormat === 1 ? 'h:mm A' : 'HH:mm'
      const start = moment(event.start_date).format(formatString)
      const end = moment(event.end_date).format(formatString)
      return `${start} - ${end}`
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
