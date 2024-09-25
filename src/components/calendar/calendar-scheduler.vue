<template>
  <div ref="scheduler">
  </div>
</template>

<script>
import Scheduler from 'dhtmlx-scheduler'
import moment from 'moment'
import { mapState } from 'vuex'

export default {
  name: 'scheduler',

  props: {
    events: {
      type: Array,
      default () {
        return {
          events: []
        }
      }
    }
  },

  computed: {
    ...mapState('auth', ['profile'])
  },

  mounted () {
    Scheduler.skin = 'material'
    Scheduler.config.header = [
      'today',
      {
        html: 'Go to Date',
        click: () => {
          this.toggleGotoDate()
        },
        css: 'btn-goto-date'
      },
      'prev',
      'next',
      'date',
      'day',
      'week',
      'month'
    ]

    Scheduler.config.date_format = '%Y-%m-%d %g:%i %A'
    Scheduler.config.hour_date = this.profile.time_format === 1 ? '%g:%i %A' : '%G:%i'
    Scheduler.config.dblclick_create = false
    Scheduler.config.details_on_dblclick = false
    Scheduler.config.drag_event_body = false
    Scheduler.config.drag_create = false
    Scheduler.config.drag_highlight = false
    Scheduler.config.drag_move = false
    Scheduler.config.drag_resize = false
    Scheduler.config.max_month_events = 4
    Scheduler.config.min_event_width = 60
    Scheduler.config.min_event_height = 20
    Scheduler.config.event_min_dy = 20
    Scheduler.xy.nav_height = 0

    Scheduler.templates.week_date = function (start, end) {
      const startDate = moment(start)
      const endDate = moment(end)

      const startMonth = startDate.format('MMM')
      const endMonth = endDate.format('MMM')
      const year = endDate.format('YYYY')

      let text = startMonth + '&ndash;' + endMonth + ' ' + year
      if (startMonth === endMonth) {
        text = startMonth + ' ' + year
      }

      return text
    }

    Scheduler.attachEvent('onEventDrag', (id, mode, e) => {
      return false
    })

    Scheduler.templates.event_class = function (start, end, event) {
      return 'event-bg-color-type-' + event.type + ' status-' + event.status + (start < new Date() ? ' is_past' : '')
    }

    Scheduler.templates.day_scale_date = function (date) {
      return ''
    }

    Scheduler.templates.month_scale_date = function (date) {
      return moment(date).format('ddd')
    }

    Scheduler.templates.month_day = function (date) {
      return moment(date).format('D')
    }

    Scheduler.templates.month_events_link = function (date, count) {
      return `<div class="custom-more-link" data-date="${date.toISOString()}" data-count="${count}">${count} more</div>`
    }

    Scheduler.templates.event_date = function (date) {
      const formatFunc = Scheduler.date.date_to_str(Scheduler.config.hour_date)
      return formatFunc(date)
    }

    Scheduler.templates.event_bar_text = function (start, end, event) {
      return event.text
        ? event.text
        : (event.contact.first_name || event.contact.last_name
          ? `${event.contact.first_name || ''} ${event.contact.last_name || ''}`
          : event.contact.phone_number)
    }

    Scheduler.templates.event_text = Scheduler.templates.event_bar_text

    Scheduler.templates.event_bar_text = () => ''
    Scheduler.templates.event_text = () => ''

    Scheduler.attachEvent('onEventRendered', this.customEventRender)

    Scheduler.attachEvent('onEmptyClick', (date, e) => {
      if (!e.target.classList.contains('custom-more-link')) {
        this.addSchedule(date)
      }
    })

    Scheduler.attachEvent('onClick', (id, e) => {
      this.editSchedule(Scheduler.getEvent(id))
    })

    Scheduler.attachEvent('onViewChange', (newMode, newDate) => {
      let state = Scheduler.getState()
      this.renderEvents(state)
      // this.updateCurrentDate(newDate)
      this.$emit('view-change', newMode, newDate)
    })

    Scheduler.init(this.$refs.scheduler, new Date(), 'month')
    Scheduler.parse(this.$props.events)
    this.$refs.scheduler.addEventListener('click', this.handleMoreLink)
    this.$nextTick(() => Scheduler.updateView())
  },

  beforeUnmount () {
    this.$refs.scheduler.removeEventListener('click', this.handleMoreLink)
  },

  methods: {
    clearAll () {
      Scheduler.clearAll()
    },

    customParse (data) {
      Scheduler.parse(data)
      Scheduler.updateView()
    },

    renderEvents (state) {
      this.$emit('render-events', state)
    },

    addSchedule (date) {
      this.$emit('add-schedule', date)
    },

    editSchedule (event) {
      this.$emit('edit-schedule', event)
    },

    updateScheduler () {
      Scheduler.updateView()
    },

    deleteEvent (id) {
      Scheduler.deleteEvent(id)
    },

    toggleGotoDate () {
      const currentDate = Scheduler.getState().date
      this.$emit('toggle-goto-date', currentDate)
    },

    setCurrentView (date, view) {
      Scheduler.setCurrentView(date, view)
      setTimeout(function () {
        Scheduler.updateView()
      }, 300)
    },

    updateCurrentDate (date) {
      this.$emit('update-current-date', date)
    },

    reInit (date, view) {
      Scheduler.config.hour_date = this.profile.time_format === 1 ? '%g:%i %A' : '%G:%i'

      Scheduler.init(this.$refs.scheduler, date, view)
      Scheduler.parse(this.$props.events)
    },

    handleMoreLink (e) {
      if (e.target.classList.contains('custom-more-link')) {
        e.preventDefault()
        e.stopPropagation()
      }
    },

    customEventRender (event, ev, container) {
      const minWidth = Scheduler.config.min_event_width || 60
      const width = Math.max(ev.width, minWidth)

      const durationInMinutes = moment(event.end_date).diff(moment(event.start_date), 'minutes')
      const baseHeight = 20

      // Calculate the height based on duration, with a minimum height
      const calculatedHeight = Math.max(baseHeight * (durationInMinutes / 30), 20)

      // Use the calculated height, but don't exceed the original height
      const height = Math.min(calculatedHeight, ev.height)

      container.style.width = `${width}px`
      container.style.height = `${height}px`

      console.log('width', width)
      console.log('height', height)

      container.innerHTML = `
        <div class="event-content">
          <div class="event-title">${event.text}</div>
          <div class="event-time">${Scheduler.templates.event_date(event.start_date)} - ${Scheduler.templates.event_date(event.end_date)}</div>
        </div>
      `
      return true
    }
  }
}
</script>
