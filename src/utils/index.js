import moment from 'moment'

export const getBrowserTimeZone = (ignoreCache) => moment.tz.guess(ignoreCache)

export const getDateInBrowserTimeZone = (date) => {
  return moment(date).tz(getBrowserTimeZone())
}
