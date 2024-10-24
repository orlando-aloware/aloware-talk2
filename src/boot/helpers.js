// Return the WebSocket credentials based on the broadcast driver
export const getWebSocketCredentials = () => {
  // Soketi should not be used in production
  if (process.env.APP_ENV !== 'production' && process.env.BROADCAST_DRIVER === 'soketi') {
    return {
      WS_APP_KEY: process.env.SOKETI_APP_KEY,
      WS_CLUSTER: process.env.SOKETI_CLUSTER,
      WS_HOST: process.env.SOKETI_HOST
    }
  }

  // Use Pusher as the default driver
  return {
    WS_APP_KEY: process.env.PUSHER_APP_KEY,
    WS_CLUSTER: process.env.PUSHER_CLUSTER,
    WS_HOST: ''
  }
}
