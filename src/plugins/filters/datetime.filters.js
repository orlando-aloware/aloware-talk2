/**
 * date time passed
 * @param {datetime|string|Moment} dt
 * @returns {string|*}
 */
export const dateTimePassed = (dt) => {
  if (dt) {
    let difference = 0
    let dateTimePassed = ''
    if (window.timezone) {
      difference = window.moment.utc(dt).tz(window.timezone).diff(window.moment.utc(new Date()), 'days')
      dateTimePassed = window.moment.utc(dt).tz(window.timezone).fromNow()
    } else {
      difference = window.moment.utc(dt).diff(window.moment.utc(new Date()), 'days')
      dateTimePassed = window.moment.utc(dt).local().fromNow()
    }

    if (difference < 1 || difference > 60) {
      return dateTimePassed
    } else {
      return difference + ' days ago'
    }
  }
}

/**
 * shortcut date time passed
 * @param {datetime|string|Moment} dt
 * @returns {string|*}
 */
export const shortDateTimePassed = (dt) => {
  if (dt) {
    let dateTimePassed = ''
    if (window.timezone) {
      dateTimePassed = window.moment.utc(dt).tz(window.timezone).fromNow()
    } else {
      dateTimePassed = window.moment.utc(dt).local().fromNow()
    }
    dateTimePassed = dateTimePassed.split(' ')
    if (dateTimePassed.length > 0 && ['a', 'an'].includes(dateTimePassed[0])) {
      dateTimePassed[0] = '1'
    }
    dateTimePassed = dateTimePassed.join(' ')
    return dateTimePassed.replace(' ago', '')
      .replace(' few', '')
      .replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' weeks', 'w')
      .replace(' week', 'w')
      .replace(' months', 'mo')
      .replace(' month', 'mo')
      .replace(' years', 'y')
      .replace(' year', 'y')
  }
}

/**
 * Fix schedule date
 * @param {date|string|Moment} dt
 * @param format
 * @returns {string|*}
 */
export const fixScheduleDate = (dt, format = 'dddd, D MMMM YYYY') => {
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
 * Fix schedule date
 * @param {datetime|string|Moment} dt
 * @param duration
 * @returns {string|*}
 */
export const fixScheduleTime = (dt, duration = 0) => {
  if (dt) {
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
  if (dt) {
    if (window.timezone) {
      return window.moment.utc(dt).tz(window.timezone).format('MM/DD h:mm:ssa')
    } else {
      return window.moment.utc(dt).local().format('MM/DD h:mma')
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
 * Humanize duration
 * @param duration
 * @returns {string|*}
 */
export const humanizeDuration = (duration) => {
  let func = require('humanize-duration')
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

  let now = window.timezone ? window.moment.utc(new Date()).tz(window.timezone) : window.moment.utc(new Date())
  let end = window.timezone ? window.moment.utc(datetime).tz(window.timezone) : window.moment.utc(datetime)
  let duration = window.moment.duration(now.diff(end))
  let asSeconds = duration.asSeconds()

  return window.moment.duration(asSeconds, 'seconds').humanize()
}

/**
 * Fix Duration UTC Relative
 * @param {string} dt
 * @returns {string}
 */
export const fixDurationUTCRelative = (dt) => {
  if (dt) {
    let now = window.moment.utc()
    let datetime = window.moment.utc(dt)
    let duration = now.diff(datetime, 'seconds')

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
    let now = window.moment.utc()
    let datetime = window.moment.utc(dt)

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

export default ({ Vue }) => {
  const filters = {
    dateTimePassed,
    shortDateTimePassed,
    fixScheduleDate,
    fixScheduleTime,
    fixRelativeDatetimeFormat,
    fixDate,
    fixDateTime,
    fixTime,
    fixTimeLocal,
    fixDuration,
    humanizeDuration,
    fixDurationHumanize,
    fixDurationUTCRelative,
    fixFullDateUTC,
    fixFullDateLocal,
    fixFullDateUTCRelative,
    fixCommunicationDateTime
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
