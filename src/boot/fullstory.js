import Vue from 'vue'
import * as FullStory from '@fullstory/browser'

if (process.env.FULLSTORY_ORG_ID) {
  FullStory.init({
    orgId: process.env.FULLSTORY_ORG_ID
    // devMode: process.env.APP_ENV === 'local'
  })
}

Vue.prototype.$FullStory = FullStory
