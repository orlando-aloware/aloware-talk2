export const DATE_RANGES = [
  'Today',
  'This Week',
  'This Month',
  'Recent (Last 30 days + Today)'
]

export const DATE_RANGES_DEFAULT_VALUE = DATE_RANGES.find((c) => {
  return c === 'Recent (Last 30 days + Today)'
})
