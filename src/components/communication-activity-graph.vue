<template>
  <div id="activity-graph" v-if="graph_can_load">
    <div class="row">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <div>
          <span v-if="filter.from_date" class="call-log-head">
            Communications
            from <strong>{{ filter.from_date | fixFullDateLocal }}</strong>
            to <strong>{{ filter.to_date | fixFullDateLocal }}</strong>
          </span>
          <span v-if="!filter.from_date" class="call-log-head">
            Communications
            <strong>All Time</strong>
          </span>
        </div>

        <div class="d-flex align-items-center">
          <strong>Chart type:</strong>
          <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                        v-model="chartType"
                        :options="chartOptions"
                        toggle-color="green"
                        no-caps
                        spread
                        unelevated
                        dense>
            <template v-slot:one>
              <span class="text-grey-90 px-3"
                    :class="[chartType === 1 ? 'text-white' : 'text-grey-90']">
                {{ chartOptions[0].labelValue }}
              </span>
            </template>
            <template v-slot:two>
              <span class="text-grey-90 px-3"
                    :class="[chartType === 2 ? 'text-white' : 'text-grey-90']">
                {{ chartOptions[1].labelValue }}
              </span>
            </template>
            <template v-slot:three>
              <span class="text-grey-90 px-3"
                    :class="[chartType === 3 ? 'text-white' : 'text-grey-90']">
                {{ chartOptions[2].labelValue }}
              </span>
            </template>
          </q-btn-toggle>
        </div>
      </div>
    </div>
    <div class="placeholder w-100 d-flex justify-content-center"
         :class="{ blink: loading }"
         v-if="loading"
         style="height: 450px">
      <img src="images/placeholder-number-of-communications.png"
           class="img-responsive"/>
    </div>
    <div v-else>
      <highstock :options="options"
                 :style="getStyle"
                 ref="highchart"
                 v-bind:id="graph_id"
                 v-show="is_done && options.series.length > 0">
      </highstock>
      <div class="d-flex justify-content-center align-items-center"
           :style="{ height: '450px' }"
           v-show="is_done && options.series.length == 0">
        <span class="text-h3 text-weight-medium"
              :style="{color: '#606266'}">
          No Data
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ReportMixin from 'src/plugins/mixins/report.mixin'
import DateMixin from 'src/plugins/mixins/date.mixin'

const chartOptions = [
  {
    value: 1,
    slot: 'one',
    type: 'spline',
    labelValue: 'Line'
  },
  {
    value: 2,
    slot: 'two',
    type: 'areaspline',
    labelValue: 'Area'
  },
  {
    value: 3,
    slot: 'three',
    type: 'column',
    labelValue: 'Bar'
  }
]

export default {
  mixins: [ReportMixin, DateMixin],

  // we load this graph from other places
  props: {
    base: { required: true },
    default_date_range: { required: false },
    campaign_id: { required: false },
    workflow_id: { required: false },
    user_id: { required: false },
    filter_ids: { required: false },
    ring_group_id: { required: false },
    broadcast_id: { required: false },
    is_first_load: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  data () {
    return {
      loading: false,
      graph_can_load: true,
      aggregated_counts: [],
      graph_id: 'activity-graph',
      report_type: 'date_v_campaign', // changes to date_v_user
      chart_period: 'day',
      chartType: 1,
      chartOptions,
      options: {
        rangeSelector: {
          enabled: false
        },

        plotOptions: {
          line: {
            dataLabels: {
              style: {
                fontSize: '14px'
              }
            }
          },
          spline: {
            marker: {
              enabled: true,
              radius: 3
            }
          },
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 3
            }
          },
          column: {
            dataLabels: {
              style: {
                fontSize: '14px'
              }
            }
          },
          series: {
            events: {
              legendItemClick: function (e) {
                // Upon cmd-click of a legend item, rather than toggling visibility, we want to hide all other items.
                let hideAllOthers = e.browserEvent.metaKey
                if (hideAllOthers) {
                  if (!this.visible) {
                    return true
                  }

                  let seriesIndex = this.index
                  let series = this.chart.series

                  for (let i = 0; i < series.length; i++) {
                    // rather than calling 'show()' and 'hide()' on the series', we use setVisible and then
                    // call chart.redraw --- this is significantly faster since it involves fewer chart redraws
                    if (series[i].index !== seriesIndex) {
                      if (series[i].visible) {
                        series[i].setVisible(false, false)
                      } else {
                        series[i].setVisible(true, false)
                      }
                    }
                  }
                  this.chart.redraw()
                  return false
                }
              }
            }
          }
        },

        time: {
          useUTC: false,
          timezone: window.timezone
        },

        // force the plot to show all ticks daily
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            millisecond: '%e %b', // always use day as highest resolution.
            second: '%e %b', // always use day as highest resolution.
            minute: '%e %b', // always use day as highest resolution.
            hour: '%H:%M',
            day: '%e %b', // always use day as highest resolution.
            week: '%e %b', // always use day as highest resolution.
            month: '%b \'%y',
            year: '%Y'
          },
          // minRange: 1 * 24 * 3600000, // 1 day
          labels: {
            rotation: 45,
            // step: 1,
            style: {
              fontSize: '14px'
            }
          }
        },

        yAxis: {
          allowDecimals: false,
          offset: 20,
          title: {
            text: 'Number Of Calls & Texts',
            style: {
              'font-size': '14px',
              'color': '#090A0D'
            }
          }
        },

        tooltip: {
          useHTML: true,
          shared: true,
          style: {
            color: '#2e3e4e',
            fontSize: '14px'
          },
          formatter: function () {
            let s = []
            s.push(`<strong class="mb-0">Number Of Calls & Texts</strong>`)
            s.push(`<span class="text-grey-900 mt-0 mb-3" style="font-size: 0.65rem">${moment(this.x).format('dddd, MMMM D YYYY').toString()}</span>`)
            for (let point of this.points.filter((a) => a.y !== 0).sort((a, b) => b.y - a.y)) {
              s.push(`<i class="fa fa-circle" style="color: ${point.series.color};"></i><span class="text-grey-900" style="font-size: 0.875rem"> ${point.series.name}: <b>${point.y.toLocaleString()}</b></span>`)
            }
            s = s.join('</br>')
            return s
          }
        },

        legend: {
          layout: 'horizontal',
          enabled: true,
          verticalAlign: 'bottom',
          floating: false
        },

        credits: {
          enabled: false
        },

        exporting: {
          sourceWidth: 0,
          sourceHeight: 0
        },

        series: [
          {
            name: 'serie',
            data: []
          }
        ]
      }
    }
  },

  mounted () {
    this.getCommunications()
  },

  computed: {
    getStyle () {
      let height = '450px'
      if (this.options.series.length > 10) {
        height = '650px'
      }
      return {
        height: height
      }
    },

    isLargeEnough () {
      let validSizes = ['xxl', 'xl', 'lg']
      if (validSizes.includes(this.$mq)) {
        return true
      }
      return false
    }
  },

  methods: {
    getCommunications () {
      // in Campaign index / user index we change the default dates
      if (this.default_date_range && this.default_date_range === 7) {
        this.filter.from_date = this.localizedMoment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        this.filter.to_date = this.localizedMoment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      this.filter.report_type = 'date_v_' + this.base // "date_v_campaign", "date_v_user"
      this.source.cancel('getCommunications canceled by the user.')
      this.source = this.CancelToken.source()
      this.is_done = false
      this.loading = true
      this.graph_can_load = true
      this.options.series = []
      this.aggregated_counts = []
      return this.$axios.get('/api/v1/reports', {
        params: this.filter,
        cancelToken: this.source.token
      }).then(res => {
        // lets do some re-assignments
        this.aggregated_counts = res.data
        // if its not json it will crash the server.
        if (!Array.isArray(this.aggregated_counts)) {
          console.log('Non json response provided')
          // stop execution
          return Promise.reject('Non json response provided')
        }

        // loop over what you got and setup the plots.
        let keys = Object.keys(this.aggregated_counts)
        let minOverall, maxOverall
        for (let index in keys) {
          // get the data from API response.
          let seriesData = this.aggregated_counts[keys[index]]
          if (this.filter_ids && !this.filter_ids.includes(seriesData.series_id)) {
            continue
          }

          // prepare min & max of time range
          let min, max

          // arrange this in hash table with timezone in mind.
          let baseData = {}
          let date

          for (let item in seriesData.data) {
            let ts = seriesData.data[item].timestamp // seconds
            // get timezone diff
            // let offset = moment().local().utcOffset() * 60  // seconds
            // adjust timezone
            // ts = ts + offset
            // removes time from datetime this will fix timezone issues
            date = parseInt(this.localizedMoment(ts, 'YYYY-MM-DD HH:mm:ss').startOf('day').format('x') / 1000)
            // push to hash table
            if (baseData[date]) {
              baseData[date] = baseData[date] + seriesData.data[item].count
            } else {
              baseData[date] = seriesData.data[item].count
            }
            if (min === undefined || min > date) {
              min = date
            }
            if (max === undefined || max < date) {
              max = date
            }
          }

          if (minOverall > min || !minOverall) {
            minOverall = min
          }

          if (maxOverall < max || !maxOverall) {
            maxOverall = max
          }

          // convert min, max to moment objects
          min = moment.unix(min)
          max = moment.unix(max)

          // create a base series based on this with all ticks available.
          let baseSeries = []

          // when period is daily
          if (this.filter.chart_period === 'day') {
            // force the plot to show all ticks
            // this.options.xAxis.tickInterval = 24 * 3600 * 1000 // 1 day
            // this.options.xAxis.labels.step = 1 // 1 day
            this.options.xAxis.tickInterval = undefined // let the plot decide
            this.options.xAxis.labels.step = undefined // let the plot decide
            if (this.filter.from_date) {
              min = moment(this.filter.from_date).startOf('day') // moment
            }
            if (this.filter.to_date) {
              max = moment(this.filter.to_date).startOf('day') // moment object
            }
          }
          // week
          if (this.filter.chart_period === 'week') {
            // force the plot to show all ticks
            this.options.xAxis.tickInterval = undefined // let the plot decide
            this.options.xAxis.labels.step = undefined // let the plot decide
            // set the plot to use definitive time-ticks based on period selected
            if (this.filter.from_date) {
              min = moment(this.filter.from_date).startOf('isoWeek').startOf('day') // moment object
            }
            if (this.filter.to_date) {
              max = moment(this.filter.to_date).startOf('isoWeek').startOf('day') // moment object
            }
            // ^^ we use isoWeek because we want it to start on Monday
          }
          // month to month handling
          if (this.filter.chart_period === 'month') {
            // force the plot to show all ticks
            this.options.xAxis.tickInterval = undefined // let the plot decide
            this.options.xAxis.labels.step = undefined // let the plot decide
            // set the plot to use definitive time-ticks based on period selected
            if (this.filter.from_date) {
              min = moment(this.filter.from_date).startOf('month').startOf('day') // moment object
            }
            if (this.filter.to_date) {
              max = moment(this.filter.to_date).startOf('month').startOf('day') // moment object
            }
          }

          // print each day
          while (min <= max) {
            let basePoint = []
            let minUnixTimestamp = min.format('X') // seconds
            // is there a match in our data?
            if (baseData[minUnixTimestamp]) {
              basePoint = [minUnixTimestamp * 1000, baseData[minUnixTimestamp]]
            } else {
              basePoint = [minUnixTimestamp * 1000, 0]
            }
            baseSeries.push(basePoint)
            min = min.add(1, this.filter.chart_period)
          }

          // form the series
          let series = {
            // temp to give us a feeling. Will give line for campaigns and column for dashboard (spline is a curved line)
            // type can be line, column, spline
            type: this.chartType,
            name: seriesData.label ? seriesData.label : 'Deleted ' + this.base,
            // color: "#0033A0",
            data: baseSeries,
            pointStart: baseSeries[0][0],
            // pointInterval: moment.duration(1, this.filter.chart_period).asMilliseconds()
            showInLegend: Object.keys(baseSeries).length > 0
          }
          // have high charts re-draw this.
          this.options.series.push(series)
        }

        if (!this.filter.from_date && !this.filter.to_date) {
          this.options.xAxis.min = minOverall * 1000
          this.options.xAxis.max = maxOverall * 1000
        } else {
          this.options.xAxis.min = undefined
          this.options.xAxis.max = undefined
        }

        this.options.xAxis.tickInterval = moment.duration(1, this.filter.chart_period).asMilliseconds()

        this.loading = false
        this.is_done = true
        this.$nextTick(() => {
          let highchartsContainer = document.getElementById(this.graph_id)

          if (highchartsContainer) {
            this.options.exporting.sourceWidth = highchartsContainer.clientWidth
            this.options.exporting.sourceHeight = highchartsContainer.clientHeight
          }
        })

        this.$emit('finished_loading')
        return Promise.resolve(res)
      }).catch(err => {
        this.$emit('finished_loading')
        if (this.$axios.isCancel(err)) {

          // return Promise.reject(err)
        } else {
          this.graph_can_load = false
          this.loading = false

          return Promise.reject(err)
        }
      })
    }
  },

  watch: {
    chartType (chartType) {
      let newSeries = []
      for (let series of this.options.series) {
        series.type = chartType
        newSeries.push(series)
      }
      this.options.series = newSeries
    }
  }
}
</script>
