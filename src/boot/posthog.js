import posthog from 'posthog-js'

export default {
  install (Vue) {
    if (process.env.POSTHOG_API_KEY) {
      posthog.init(
        process.env.POSTHOG_API_KEY,
        {
          api_host: 'https://us.i.posthog.com',
          capture_pageview: false,
          capture_pageleave: true
        }
      )
    }

    Vue.prototype.$posthog = posthog
  }
}
