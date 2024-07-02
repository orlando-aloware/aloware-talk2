import moment from 'moment'

const units = {
  ' few': '',
  ' seconds': 's',
  ' second': 's',
  ' minutes': 'm',
  ' minute': 'm',
  ' hours': 'h',
  ' hour': 'h',
  ' days': 'd',
  ' day': 'd',
  ' weeks': 'w',
  ' week': 'w',
  ' months': 'mo',
  ' month': 'mo',
  ' years': 'y',
  ' year': 'y'
}

const future = {
  's': {
    'max': 1,
    'unit': 'm'
  },
  'm': {
    'max': 45,
    'unit': 'h'
  },
  'h': {
    'max': 22,
    'unit': 'd'
  },
  'd': {
    'max': 6,
    'unit': 'w'
  },
  'w': {
    'max': 3,
    'unit': 'mo'
  },
  'mo': {
    'max': 11,
    'unit': 'y'
  },
  'y': {
    'max': null,
    'unit': 'y'
  }
}

/**
 * date time passed
 * @param {datetime|string|Moment} dt
 * @returns {string|*}
 */
export const dateTimePassed = (dt) => {
  if (dt) {
    const difference = { data: 0 }
    const dateTimePassed = { data: '' }
    if (window.timezone) {
      difference.data = window.moment.utc(dt).tz(window.timezone).diff(window.moment.utc(new Date()), 'days')
      dateTimePassed.data = window.moment.utc(dt).tz(window.timezone).fromNow()
    } else {
      difference.data = window.moment.utc(dt).diff(window.moment.utc(new Date()), 'days')
      dateTimePassed.data = window.moment.utc(dt).local().fromNow()
    }

    if (difference.data < 1 || difference > 60) {
      return dateTimePassed.data
    } else {
      return difference.data + ' days ago'
    }
  }
}

/**
 * shortcut date time passed
 * @param {datetime|string|Moment} dt
 * @returns {string|*}
 */
export const shortDateTimePassed = (dt, replaceAgo = true) => {
  const dateTimePassed = { text: '' }

  if (dt && window.timezone) {
    dateTimePassed.text = window.moment.utc(dt).tz(window.timezone).fromNow(replaceAgo)
  }

  if (dt && !window.timezone) {
    dateTimePassed.text = window.moment.utc(dt).local().fromNow(replaceAgo)
  }

  if (!dt && window.timezone) {
    dateTimePassed.text = window.moment.utc().tz(window.timezone).fromNow(replaceAgo)
  }

  if (!dt && !window.timezone) {
    dateTimePassed.text = window.moment.utc().local().fromNow(replaceAgo)
  }

  if (dateTimePassed.text.includes('a few seconds')) {
    return 'Now'
  }

  dateTimePassed.text = dateTimePassed.text.split(' ')
  if (dateTimePassed.text.length > 0 && ['a', 'an'].includes(dateTimePassed.text[0])) {
    dateTimePassed.text[0] = '1'
  }

  dateTimePassed.text = dateTimePassed.text.join(' ')

  const unit = { data: null }
  for (unit.data in units) {
    if (dateTimePassed.text.includes(unit.data)) {
      dateTimePassed.text = dateTimePassed.text.replace(unit.data, units[unit.data])
    }
  }

  return dateTimePassed.text
}

/**
 * shortcut date time passed (less than)
 * @param {datetime|string|Moment} dt
 * @returns {string|*}
 */
export const shortDateTimePassedLessThan = (dt, replaceAgo = true) => {
  const dateTimePassed = { text: '', num: 0 }

  moment.relativeTimeThreshold('s', 60)
  moment.relativeTimeThreshold('m', 60)
  moment.relativeTimeThreshold('h', 24)
  moment.relativeTimeThreshold('d', 7)
  moment.relativeTimeThreshold('w', 4)
  moment.relativeTimeThreshold('M', 12)

  if (dt && window.timezone) {
    dateTimePassed.text = moment.utc(dt).tz(window.timezone).fromNow(replaceAgo)
  }

  if (dt && !window.timezone) {
    dateTimePassed.text = moment.utc(dt).local().fromNow(replaceAgo)
  }

  if (!dt && window.timezone) {
    dateTimePassed.text = moment.utc().tz(window.timezone).fromNow(replaceAgo)
  }

  if (!dt && !window.timezone) {
    dateTimePassed.text = moment.utc().local().fromNow(replaceAgo)
  }

  if (dateTimePassed.text.includes('a few seconds')) {
    return 'Now'
  }

  dateTimePassed.text = dateTimePassed.text.replace(' few', '')
  dateTimePassed.text = dateTimePassed.text.split(' ')

  if (dateTimePassed.text.length > 0 && ['a', 'an'].includes(dateTimePassed.text[0])) {
    dateTimePassed.text[0] = '1'
  }

  dateTimePassed.num = parseInt(dateTimePassed.text[0])

  const unit = { data: null, cond: false }
  for (unit.data in units) {
    if (dateTimePassed.text[1].trim() === unit.data.trim()) {
      dateTimePassed.text[1] = dateTimePassed.text[1].trim().replace(unit.data.trim(), units[unit.data])
      unit.cond = future[dateTimePassed.text[1]].max ? dateTimePassed.num < future[dateTimePassed.text[1]].max : true
      dateTimePassed.text[0] = unit.cond ? `${dateTimePassed.num}` : '1'
      dateTimePassed.text[1] = unit.cond ? dateTimePassed.text[1] : future[dateTimePassed.text[1]].unit
      break
    }
  }

  return dateTimePassed.text.join('')
}

/**
 * Fix schedule date
 * @param {date|string|Moment} dt
 * @param format
 * @param timezone
 * @returns {string|*}
 */
export const fixScheduleDate = (dt, format = 'dddd, D MMMM YYYY', timezone) => {
  if (dt) {
    if (timezone) {
      return window.moment.utc(dt).tz(timezone).format(format)
    }

    if (window.timezone) {
      return window.moment.utc(dt).tz(window.timezone).format(format)
    } else {
      return window.moment.utc(dt).local().format(format)
    }
  } else {
    return '-'
  }
}

/**
 * Fix schedule date
 * @param {datetime|string|Moment} dt
 * @param duration
 * @param timezone
 * @returns {string|*}
 */
export const fixScheduleTime = (dt, duration = 0, timezone) => {
  if (dt) {
    if (timezone) {
      return window.moment.utc(dt).tz(timezone).add(duration, 'seconds').format('h:mm A z')
    }

    if (window.timezone) {
      if (window.timezone === 'Asia/Manila') {
        return window.moment.utc(dt).tz(window.timezone).add(duration, 'seconds').format('h:mm A') + ' MNL'
      }

      return window.moment.utc(dt).tz(window.timezone).add(duration, 'seconds').format('h:mm A z')
    } else {
      return window.moment.utc(dt).local().add(duration, 'seconds').format('h:mm A z')
    }
  } else {
    return '-'
  }
}

/**
 * Fix relative date time format
 * @param {datetime|string|Moment} dt
 * @param format
 * @returns {string|*}
 */
export const fixRelativeDatetimeFormat = (dt, format = 'dddd, MMMM D, YYYY h:mm A z') => {
  if (dt) {
    if (window.timezone) {
      return window.moment.utc(dt).tz(window.timezone).format(format)
    } else {
      return window.moment.utc(dt).local().format(format)
    }
  } else {
    return '-'
  }
}

/**
 * Fix date
 * @param {date|string|Moment} dt
 * @param format
 * @returns {string|*}
 */
export const fixDate = (dt, format = 'YYYY-MM-DD') => {
  if (dt) {
    if (window.timezone) {
      return window.moment.utc(dt).tz(window.timezone).format(format)
    } else {
      return window.moment.utc(dt).local().format(format)
    }
  } else {
    return '-'
  }
}

/**
 * Fix date time
 * @param {date|string|Moment} dt
 * @returns {string|*}
 */
export const fixDateTime = (dt) => {
  if (!dt) {
    return '-'
  }

  if (window.timezone) {
    return window.moment.utc(dt).tz(window.timezone).format('MM/DD/YYYY h:mm:ssa')
  }

  return window.moment.utc(dt).local().format('MM/DD/YYYY h:mma')
}

/**
 * Fix date time
 * @param {date|string|Moment} dt
 * @returns {string|*}
 */
export const fixFullDateTime = (dt) => {
  if (dt) {
    if (window.timezone) {
      if (window.timezone === 'Asia/Manila') {
        return window.moment.utc(dt).tz(window.timezone).format('YYYY-MM-DD h:mm:ssa') + ' MNL'
      }
      return window.moment.utc(dt).tz(window.timezone).format('YYYY-MM-DD h:mm:ssa z')
    } else {
      return window.moment.utc(dt).local().format('YYYY-MM-DD h:mm:ssa z')
    }
  } else {
    return '-'
  }
}

/**
 * Fix date time
 * @param {date|string|Moment} dt
 * @returns {string|*}
 */
export const fixFullDate = (dt) => {
  if (dt) {
    if (window.timezone) {
      if (window.timezone === 'Asia/Manila') {
        return window.moment.utc(dt).tz(window.timezone).format('YYYY-MM-DD') + ' MNL'
      }
      return window.moment.utc(dt).tz(window.timezone).format('YYYY-MM-DD')
    } else {
      return window.moment.utc(dt).local().format('YYYY-MM-DD')
    }
  } else {
    return '-'
  }
}

/**
 * Fix time
 * @param {date|string|Moment} dt
 * @param {string} format
 * @returns {string|*}
 */
export const fixTime = (dt, format = 'h:mma') => {
  if (dt) {
    if (window.timezone) {
      return window.moment.utc(dt, 'HH:mm:ss').tz(window.timezone).format(format)
    } else {
      return window.moment.utc(dt, 'HH:mm:ss').local().format(format)
    }
  } else {
    return '-'
  }
}

/**
 * Fix time local
 * @param {date|string|Moment} dt
 * @param format
 * @returns {string|*}
 */
export const fixTimeLocal = (dt, format = 'h:mma') => {
  if (dt) {
    if (window.timezone) {
      return window.moment(dt, 'HH:mm:ss').format(format)
    } else {
      return window.moment(dt, 'HH:mm:ss').format(format)
    }
  } else {
    return '-'
  }
}

/**
 * Fix duration
 * @param duration
 * @returns {string|*}
 */
export const fixDuration = (duration, forceDuration = false) => {
  if (duration) {
    return window.moment.duration(duration, 'seconds').format('m:ss', {
      trim: false
    })
  } else if (duration === 0 && forceDuration) {
    return '0:00'
  } else {
    return '-'
  }
}

/**
 * Fix full duration
 * @param duration
 * @returns {string|*}
 */
export const fixFullDuration = (duration) => {
  if (duration !== undefined) {
    const seconds = duration
    const hour = Math.floor(seconds / 3600)
    const min = Math.floor(seconds / 60 % 60)
    const sec = Math.floor(seconds % 60)
    const result = { data: '' }
    const unitCount = { data: 0 }

    if (hour) {
      result.data += `${hour}h`
      unitCount.data++
    }

    if (min) {
      result.data += ` ${min}m`
      unitCount.data++
    }

    if (unitCount.data === 2) {
      return result.data
    }

    return (result.data + ` ${sec}s`).trim()
  } else {
    return '-'
  }
}

/**
 * Humanize duration
 * @param duration
 * @returns {string|*}
 */
export const humanizeDuration = (duration) => {
  const func = require('humanize-duration')
  if (duration) {
    return func(window.moment.duration(duration, 'seconds').asMilliseconds())
  } else {
    return '-'
  }
}

/**
 * Fix duration humanize
 * @param {string} datetime
 * @returns {string}
 */
export const fixDurationHumanize = (datetime) => {
  if (datetime === undefined) {
    return '-'
  }

  const now = window.timezone ? window.moment.utc(new Date()).tz(window.timezone) : window.moment.utc(new Date())
  const end = window.timezone ? window.moment.utc(datetime).tz(window.timezone) : window.moment.utc(datetime)

  return window.moment.duration(window.moment.duration(now.diff(end)).asSeconds(), 'seconds').humanize()
}

/**
 * Fix Duration UTC Relative
 * @param {string} dt
 * @returns {string}
 */
export const fixDurationUTCRelative = (dt) => {
  if (dt) {
    const duration = window.moment.utc().diff(window.moment.utc(dt), 'seconds')

    if (window.moment.duration(duration, 'seconds').hours() >= 1) {
      return window.moment.duration(duration, 'seconds').format('HH:mm:ss', {
        trim: false
      })
    } else {
      return window.moment.duration(duration, 'seconds').format('mm:ss', {
        trim: false
      })
    }
  } else {
    return ''
  }
}

/**
 * Fix full date UTC
 * @param {date|string|Moment} dt
 * @returns {string|*}
 */
export const fixFullDateUTC = (dt) => {
  if (dt) {
    if (window.timezone) {
      return window.moment(dt).utc().tz(window.timezone).format('MMM D, YYYY')
    } else {
      return window.moment(dt).utc().local().format('MMM D, YYYY')
    }
  } else {
    return '-'
  }
}

/**
 * Fix full date local
 * @param {date|string|Moment} dt
 * @returns {string|*}
 */
export const fixFullDateLocal = (dt) => {
  if (dt) {
    if (window.timezone) {
      return window.moment(dt).utc().tz(window.timezone).format('MMM D, YYYY')
    } else {
      return window.moment(dt).utc().local().format('MMM D, YYYY')
    }
  } else {
    return '-'
  }
}

/**
 * Fix full date URC relative
 * @param {date|string|Moment} dt
 * @returns {string|*}
 */
export const fixFullDateUTCRelative = (dt) => {
  if (dt) {
    const now = window.moment.utc()
    const datetime = window.moment.utc(dt)

    if (now.diff(datetime) < 24 * 60 * 60 * 1000) {
      if (window.timezone) {
        return datetime.tz(window.timezone).fromNow()
      } else {
        return datetime.local().format('MMM D')
      }
    } else {
      if (window.timezone) {
        if (window.timezone === 'Asia/Manila') {
          return window.moment.utc(dt).tz(window.timezone).format('MMM D, YYYY H:mma') + ' MNL'
        }
        return datetime.tz(window.timezone).format('MMM D h:mma z')
      } else {
        return datetime.local().format('MMM D h:mma z')
      }
    }
  } else {
    return ''
  }
}

export const fixCommunicationDateTime = (dt, duration = 0) => {
  if (dt) {
    if (window.timezone) {
      if (window.timezone === 'Asia/Manila') {
        return window.moment.utc(dt).tz(window.timezone).add(duration, 'seconds').format('MM/DD h:mm A') + ' MNL'
      }

      return window.moment.utc(dt).tz(window.timezone).add(duration, 'seconds').format('MM/DD h:mm A z')
    } else {
      return window.moment.utc(dt).local().add(duration, 'seconds').format('MM/DD h:mm A z')
    }
  } else {
    return '-'
  }
}

export const formatTime = (time, formatTo24Hr) => {
  return window.moment(time, 'HHmm').format(formatTo24Hr ? 'HH:mm' : 'hh:mm A')
}

export const utcToLocalizedMoment = (dt) => {
  if (dt) {
    if (window.timezone) {
      return window.moment.utc(dt).tz(window.timezone)
    } else {
      return window.moment.utc(dt).local()
    }
  } else {
    if (window.timezone) {
      return window.moment.utc().tz(window.timezone)
    } else {
      return window.moment.utc().local()
    }
  }
}

export default ({ Vue }) => {
  const filters = {
    dateTimePassed,
    shortDateTimePassed,
    shortDateTimePassedLessThan,
    fixScheduleDate,
    fixScheduleTime,
    fixRelativeDatetimeFormat,
    fixDate,
    fixDateTime,
    fixFullDateTime,
    fixFullDate,
    fixTime,
    fixTimeLocal,
    fixDuration,
    fixFullDuration,
    humanizeDuration,
    fixDurationHumanize,
    fixDurationUTCRelative,
    fixFullDateUTC,
    fixFullDateLocal,
    fixFullDateUTCRelative,
    fixCommunicationDateTime,
    formatTime,
    utcToLocalizedMoment
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
