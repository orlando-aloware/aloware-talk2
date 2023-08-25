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
      return `<a>${count} more</a>`
    }

    Scheduler.templates.event_date = function (date) {
      const formatFunc = Scheduler.date.date_to_str(Scheduler.config.hour_date)
      return formatFunc(date)
    }

    Scheduler.templates.event_bar_text = function (start, end, event) {
      return event.contact.first_name || event.contact.last_name
        ? `${event.contact.first_name || ''} ${event.contact.last_name || ''}`
        : event.contact.phone_number
    }

    Scheduler.templates.event_text = Scheduler.templates.event_bar_text

    Scheduler.attachEvent('onEmptyClick', (date, e) => {
      this.addSchedule(date)
    })

    Scheduler.attachEvent('onClick', (id, e) => {
      this.editSchedule(Scheduler.getEvent(id))
    })

    Scheduler.attachEvent('onViewChange', (newMode, newDate) => {
      let state = Scheduler.getState()
      this.renderEvents(state)
      this.updateCurrentDate(newDate)
      this.$emit('view-change', newMode)
    })

    Scheduler.init(this.$refs.scheduler, new Date(), 'month')
    Scheduler.parse(this.$props.events)
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
      this.$emit('toggle-goto-date')
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
    }
  }
}
</script>
