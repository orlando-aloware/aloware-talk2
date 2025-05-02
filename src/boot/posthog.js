import posthog from 'posthog-js'

export default {
  install (Vue) {
    posthog.init(
      '',
      {
        api_host: 'https://us.i.posthog.com',
        capture_pageview: false,
        capture_pageleave: true
      }
    )

    Vue.prototype.$posthog = posthog
  }
}
