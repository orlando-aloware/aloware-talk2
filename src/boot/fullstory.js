import * as FullStory from '@fullstory/browser'
import Vue from 'vue'

if (process.env.FULLSTORY_ORG_ID) {
  FullStory.init({
    orgId: process.env.FULLSTORY_ORG_ID,
    startCaptureManually: true
    // devMode: process.env.APP_ENV === 'local'
  })
}

Vue.prototype.$FullStory = FullStory
