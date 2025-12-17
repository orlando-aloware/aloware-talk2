// Return the WebSocket credentials based on the broadcast driver
export const getWebSocketCredentials = () => {
  // Use Soketi as the only driver
  return {
    WS_APP_KEY: process.env.SOKETI_APP_KEY,
    WS_CLUSTER: process.env.SOKETI_CLUSTER,
    WS_HOST: process.env.SOKETI_HOST
  }
}
