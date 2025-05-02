import posthog from 'posthog-js'

export default {
  install (Vue) {
    posthog.init(
      'phc_Qvfr0aYv5uZP7iZbEvy7ylcRalLTNeuTTJ6Gs2sFmyj',
      {
        api_host: 'https://us.i.posthog.com',
        capture_pageview: false,
        capture_pageleave: true
      }
    )

    Vue.prototype.$posthog = posthog
  }
}
