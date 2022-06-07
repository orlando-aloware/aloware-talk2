import Vue from 'vue'
import * as FullStory from '@fullstory/browser'

FullStory.init({ orgId: process.env.FULLSTORY_ORG_ID })

Vue.prototype.$FullStory = FullStory
