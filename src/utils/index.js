import moment from 'moment'

export const browserTimezone = (ignoreCache) => moment.tz.guess(ignoreCache)

export const getDateInBrowserTimeZone = (date) => {
  return moment(date).tz(browserTimezone())
}
