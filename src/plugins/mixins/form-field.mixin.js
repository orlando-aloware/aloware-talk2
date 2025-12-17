import moment from 'moment'
export const formFieldMixin = {
  data () {
    return {
      selected: this.selectedTime,
      times: []
    }
  },
  props: {
    name: {
      type: String,
      required: true
    },
    day: {
      type: String,
      required: true
    },
    hours: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    inputNum: {
      type: Number,
      required: true
    },
    totalInputs: {
      type: Number,
      required: true
    },
    selectedTime: {
      type: String,
      required: true
    },
    timeIncrement: {
      type: Number,
      required: true
    },
    localization: {
      type: Object
    },
    hourFormat24: {
      type: Boolean
    }
  },
  created () {
    this.times = this.generateTimes(this.timeIncrement)
  },
  watch: {
    selectedTime: function () {
      this.selected = this.selectedTime
    }
  },
  computed: {
    whichTime: function () {
      return this.isEven(this.inputNum) ? 'close' : 'open'
    },
    defaultText: function () {
      return this.whichTime === 'open'
        ? this.localization.placeholderOpens
        : this.localization.placeholderCloses
    },
    optionName: function () {
      return (
        this.name +
        '[' +
        this.day +
        '][' +
        this.index +
        '][' +
        this.whichTime +
        ']'
      )
    },
    filteredTimes: function () {
      const prevTime = { data: this.getPrevious(this.hours, this.index, this.inputNum) },
        nextTime = { data: this.getNext(
          this.hours,
          this.index,
          this.inputNum,
          this.totalInputs
        ) },
        filteredTimes = { data: this.times }

      if (!this.isFirstRow(this.index) && prevTime.data === '') {
        prevTime.data = this.getPrevious(this.hours, this.index, this.inputNum - 1)
      }

      if (this.isFirstInput(this.inputNum)) {
        filteredTimes.data = this.getFiltered('before', nextTime.data, filteredTimes.data)
      } else if (this.isLastInput(this.inputNum, this.totalInputs)) {
        filteredTimes.data = this.getFiltered('after', prevTime.data, filteredTimes.data)
      } else {
        filteredTimes.data = this.getFiltered('before', nextTime.data, filteredTimes.data)
        filteredTimes.data = this.getFiltered('after', prevTime.data, filteredTimes.data)
      }

      return filteredTimes.data
    },
    showMidnightOption: function () {
      return (
        this.isLastRow(this.index, this.hours) &&
        this.whichTime === 'close' &&
        this.hours[this.index].close !== '24hrs'
      )
    }
  },
  methods: {
    inputEventHandler: function (e) {
      this.$emit('input-change', e.target.value)
    },
    generateTimes: function (timeIncrement) {
      const currentTime = { data: '0000' },
        times = []

      do {
        times.push(currentTime.data)
        currentTime.data = moment(currentTime.data, 'HHmm')
          .add(timeIncrement, 'minutes')
          .format('HHmm')
      } while (currentTime.data !== '0000')

      return times
    },
    getFiltered: function (when, adjacentTime, collection) {
      if (
        this.isLastInput(this.inputNum, this.totalInputs) &&
        this.hours[this.index].open === ''
      ) {
        collection = collection.filter(value => value > adjacentTime)
        collection.shift()
        return collection
      }

      if (adjacentTime === '') {
        return collection
      }

      if (when === 'before') {
        collection = collection.filter(value => value < adjacentTime)
      } else if (when === 'after') {
        collection = collection.filter(value => value > adjacentTime)
      }

      return collection
    }
  }
}
