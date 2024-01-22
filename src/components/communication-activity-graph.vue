<template>
  <div id="activity-graph"
       class="activity-graph"
       v-if="graphCanLoad">
    <div class="activity-graph__header">
      <div>
        <span class="call-log-head"
              v-if="filter.from_date">
          Communications
          from <strong>{{ filter.from_date | fixFullDateLocal }}</strong>
          to <strong>{{ filter.to_date | fixFullDateLocal }}</strong>
        </span>
        <span class="call-log-head"
              v-if="!filter.from_date">
          Communications
          <strong>All Time</strong>
        </span>
      </div>

      <div class="d-flex align-items-center chart-types">
        <strong>Chart type:</strong>
        <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                      toggle-color="green"
                      no-caps
                      spread
                      unelevated
                      dense
                      :options="chartOptions"
                      v-model="chartType">
          <template v-slot:one>
            <span class="text-grey-90 px-3"
                  :class="[chartType === 'spline' ? 'text-white' : 'text-grey-90']">
              {{ chartOptions[0].labelValue }}
            </span>
          </template>
          <template v-slot:two>
            <span class="text-grey-90 px-3"
                  :class="[chartType === 'areaspline' ? 'text-white' : 'text-grey-90']">
              {{ chartOptions[1].labelValue }}
            </span>
          </template>
          <template v-slot:three>
            <span class="text-grey-90 px-3"
                  :class="[chartType === 'column' ? 'text-white' : 'text-grey-90']">
              {{ chartOptions[2].labelValue }}
            </span>
          </template>
        </q-btn-toggle>
      </div>
    </div>
    <div class="placeholder w-100 d-flex justify-content-center"
         style="height: 450px"
         :class="{ blink: loading }"
         v-if="loading">
      <img src="images/placeholder-number-of-communications.png"
           class="img-responsive"/>
    </div>
    <div v-else>
      <highstock ref="highchart"
                 :options="options"
                 :style="getStyle"
                 :id="graphId"
                 v-if="ready && options.series.length > 0">
      </highstock>
      <div class="d-flex justify-content-center align-items-center"
           :style="{ height: '450px' }"
           v-if="isNoData">
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
    value: 'spline',
    slot: 'one',
    type: 'spline',
    labelValue: 'Line'
  },
  {
    value: 'areaspline',
    slot: 'two',
    type: 'areaspline',
    labelValue: 'Area'
  },
  {
    value: 'column',
    slot: 'three',
    type: 'column',
    labelValue: 'Bar'
  }
]

export default {
  name: 'communication-activity-graph',

  mixins: [
    ReportMixin,
    DateMixin
  ],

  // we load this graph from other places
  props: {
    base: {
      type: String,
      required: true
    },

    defaultDateRange: {
      type: Number,
      required: false
    }
  },

  data () {
    return {
      loading: false,
      graphCanLoad: true,
      aggregatedCounts: [],
      graphId: 'activity-graph',
      chartType: 'spline',
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
        navigator: {
          enabled: false
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

            return s.join('</br>')
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
          sourceHeight: 0,
          menuItemDefinitions: {
            printChart: {
              onclick () {
                window.print()
              }
            }
          }
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
      return {
        height: this.options.series.length > 10 ? '650px' : '450px'
      }
    },

    isLargeEnough () {
      return ['xxl', 'xl', 'lg'].includes(this.$mq)
    },

    isNoData () {
      return this.ready && this.options.series.length === 0
    }
  },

  methods: {
    getCommunications () {
      // in Campaign index / user index we change the default dates
      if (this.defaultDateRange && this.defaultDateRange === 7) {
        this.filter.from_date = this.localizedMoment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        this.filter.to_date = this.localizedMoment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }

      this.filter.report_type = 'date_v_' + this.base // "date_v_campaign", "date_v_user"
      this.source.cancel('getCommunications canceled by the user.')
      this.source = this.cancelToken.source()
      this.ready = false
      this.loading = true
      this.graphCanLoad = true
      this.options.series = []
      this.aggregatedCounts = []

      return this.$axios.get('/api/v1/reports', {
        params: this.filter,
        cancelToken: this.source.token
      }).then(res => {
        // lets do some re-assignments
        this.aggregatedCounts = res.data

        // if its not json it will crash the server.
        if (!Array.isArray(this.aggregatedCounts)) {
          console.log('Non json response provided')
          // stop execution
          return Promise.reject('Non json response provided')
        }

        // loop over what you got and setup the plots.
        const keys = Object.keys(this.aggregatedCounts)
        let minOverall, maxOverall

        for (const index in keys) {
          // get the data from API response.
          const seriesData = this.aggregatedCounts[keys[index]]

          if (this.filter_ids && !this.filter_ids.includes(seriesData.series_id)) {
            continue
          }

          // prepare min & max of time range
          let min, max

          // arrange this in hash table with timezone in mind.
          const baseData = {}
          let date

          for (const item in seriesData.data) {
            const ts = seriesData.data[item].timestamp // seconds

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
          const baseSeries = []

          // when period is daily
          if (this.filter.chart_period === 'day') {
            // force the plot to show all ticks
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
            const minUnixTimestamp = min.format('X') // seconds

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
          const series = {
            // temp to give us a feeling. Will give line for campaigns and column for dashboard (spline is a curved line)
            // type can be line, column, spline
            type: this.chartType,
            name: seriesData.label ? seriesData.label : 'Deleted ' + this.base,
            data: baseSeries,
            pointStart: baseSeries[0][0],
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
        this.ready = true
        this.$nextTick(() => {
          const highchartsContainer = document.getElementById(this.graphId)

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
          this.graphCanLoad = false
          this.loading = false

          return Promise.reject(err)
        }
      })
    }
  },

  watch: {
    chartType (chartType) {
      let newSeries = []

      for (const series of this.options.series) {
        series.type = chartType
        newSeries.push(series)
      }

      this.options.series = newSeries
    }
  }
}
</script>
