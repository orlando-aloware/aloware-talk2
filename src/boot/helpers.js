// Return the WebSocket credentials based on the broadcast driver
export const getWebSocketCredentials = (driver) => {
  if (driver === 'soketi') {
    return {
      WS_APP_KEY: process.env.SOKETI_APP_KEY,
      WS_CLUSTER: process.env.SOKETI_CLUSTER,
      WS_HOST: process.env.SOKETI_HOST
    }
  }

  // Use Soketi as the default driver
  return {
    WS_APP_KEY: process.env.SOKETI_APP_KEY,
    WS_CLUSTER: process.env.SOKETI_CLUSTER,
    WS_HOST: process.env.SOKETI_HOST
  }
}
