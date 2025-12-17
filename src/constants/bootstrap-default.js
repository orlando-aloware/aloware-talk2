export const NOTIFICATION_CONFIGURATION = {
  // used as a limit to the interval as we don't like it running forever.
  // interval will run up to 60 seconds max, depending on notificationIntervalMilliseconds
  // 60 seconds limit / 0.500 seconds (milliseconds) interval = 120
  clearIntervalSecondsLimit: 120,
  notificationIntervalMilliseconds: 500
}
