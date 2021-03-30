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

export const fixDuration = (duration) => {
  if (duration) {
    return window.moment.duration(duration, 'seconds').format('m:ss', {
      trim: false
    })
  } else {
    return '-'
  }
}

export const humanizeDuration = (duration) => {
  let func = require('humanize-duration')
  if (duration) {
    return func(window.moment.duration(duration, 'seconds').asMilliseconds())
  } else {
    return '-'
  }
}

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
        return datetime.tz(window.timezone).format('MMM D h:mma')
      } else {
        return datetime.local().format('MMM D h:mma')
      }
    }
  } else {
    return ''
  }
}

export default ({ Vue }) => {
  const filters = {
    fixDate,
    fixDateTime,
    fixTime,
    fixTimeLocal,
    fixDuration,
    humanizeDuration,
    fixFullDateUTC,
    fixFullDateLocal,
    fixFullDateUTCRelative
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
