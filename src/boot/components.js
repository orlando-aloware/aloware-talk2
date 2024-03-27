import Vue from 'vue'
import VueMasonryGallery from 'vue-masonry-gallery/vendor/VueMasonryGallery/VueMasonryGallery'
import VueBootstrapAutocomplete from '@vue-bootstrap-components/vue-bootstrap-autocomplete'

// Global registration
Vue.component('vue-bootstrap-autocomplete', VueBootstrapAutocomplete)

// contact call disposition icons
Vue.component('outbound-call-answered-icon', require('src/components/icons/contact-activity/outbound-call-answered-icon').default)
Vue.component('outbound-call-inprogress-icon', require('src/components/icons/contact-activity/outbound-call-inprogress-icon').default)
Vue.component('outbound-call-failed-icon', require('src/components/icons/contact-activity/outbound-call-failed-icon').default)
Vue.component('outbound-call-abandoned-icon', require('src/components/icons/contact-activity/outbound-call-abandoned-icon').default)
Vue.component('outbound-call-missed-icon', require('src/components/icons/contact-activity/outbound-call-missed-icon').default)
Vue.component('outbound-call-voicemail-icon', require('src/components/icons/contact-activity/outbound-call-voicemail-icon').default)
Vue.component('inbound-call-answered-icon', require('src/components/icons/contact-activity/inbound-call-answered-icon').default)
Vue.component('inbound-call-inprogress-icon', require('src/components/icons/contact-activity/inbound-call-inprogress-icon').default)
Vue.component('inbound-call-failed-icon', require('src/components/icons/contact-activity/inbound-call-failed-icon').default)
Vue.component('inbound-call-deadend-icon', require('src/components/icons/contact-activity/inbound-call-deadend-icon').default)
Vue.component('inbound-call-abandoned-icon', require('src/components/icons/contact-activity/inbound-call-abandoned-icon').default)
Vue.component('inbound-call-callback-pending-icon', require('components/icons/contact-activity/inbound-call-callback-pending-icon.vue').default)
Vue.component('inbound-call-missed-icon', require('src/components/icons/contact-activity/inbound-call-missed-icon').default)
Vue.component('inbound-call-voicemail-icon', require('src/components/icons/contact-activity/inbound-call-voicemail-icon').default)
Vue.component('outbound-recorded-answered-icon', require('src/components/icons/contact-activity/outbound-recorded-answered-icon').default)
Vue.component('inbound-recorded-answered-icon', require('src/components/icons/contact-activity/inbound-recorded-answered-icon').default)
Vue.component('inbound-recorded-missed-icon', require('src/components/icons/contact-activity/inbound-recorded-missed-icon').default)
Vue.component('outbound-recorded-missed-icon', require('src/components/icons/contact-activity/outbound-recorded-missed-icon').default)

// contact sms disposition icons
Vue.component('inbound-sms-completed-icon', require('src/components/icons/contact-activity/inbound-sms-completed-icon').default)
Vue.component('inbound-sms-failed-icon', require('src/components/icons/contact-activity/inbound-sms-failed-icon').default)
Vue.component('inbound-sms-inprogress-icon', require('src/components/icons/contact-activity/inbound-sms-inprogress-icon').default)
Vue.component('outbound-sms-completed-icon', require('src/components/icons/contact-activity/outbound-sms-completed-icon').default)
Vue.component('outbound-sms-failed-icon', require('src/components/icons/contact-activity/outbound-sms-failed-icon').default)
Vue.component('outbound-sms-inprogress-icon', require('src/components/icons/contact-activity/outbound-sms-inprogress-icon').default)

// contact email disposition icons
Vue.component('inbound-email-completed-icon', require('src/components/icons/contact-activity/inbound-email-completed-icon').default)
Vue.component('inbound-email-failed-icon', require('src/components/icons/contact-activity/inbound-email-failed-icon').default)
Vue.component('inbound-email-inprogress-icon', require('src/components/icons/contact-activity/inbound-email-inprogress-icon').default)
Vue.component('outbound-email-completed-icon', require('src/components/icons/contact-activity/outbound-email-completed-icon').default)
Vue.component('outbound-email-failed-icon', require('src/components/icons/contact-activity/outbound-email-failed-icon').default)
Vue.component('outbound-email-inprogress-icon', require('src/components/icons/contact-activity/outbound-email-inprogress-icon').default)

// contact email disposition icons
Vue.component('inbound-fax-completed-icon', require('src/components/icons/contact-activity/inbound-fax-completed-icon').default)
Vue.component('inbound-fax-missed-icon', require('src/components/icons/contact-activity/inbound-fax-missed-icon').default)
Vue.component('inbound-fax-inprogress-icon', require('src/components/icons/contact-activity/inbound-fax-inprogress-icon').default)
Vue.component('outbound-fax-completed-icon', require('src/components/icons/contact-activity/outbound-fax-completed-icon').default)
Vue.component('outbound-fax-missed-icon', require('src/components/icons/contact-activity/outbound-fax-missed-icon').default)
Vue.component('outbound-fax-inprogress-icon', require('src/components/icons/contact-activity/outbound-fax-inprogress-icon').default)
Vue.component('outbound-fax-failed-icon', require('src/components/icons/contact-activity/outbound-fax-failed-icon').default)

// appointment
Vue.component('appointment-icon', require('src/components/icons/contact-activity/appointment-icon').default)

// reminder
Vue.component('reminder-icon', require('src/components/icons/contact-activity/reminder-icon').default)

// voicemail
Vue.component('inbound-voicemail-icon', require('src/components/icons/contact-activity/inbound-voicemail-icon').default)
Vue.component('outbound-voicemail-icon', require('src/components/icons/contact-activity/inbound-voicemail-icon').default)

// note
Vue.component('note-icon', require('src/components/icons/contact-activity/note-icon').default)

// masonry gallery for giphy component
Vue.component('vue-masonry-gallery', VueMasonryGallery)

// notification icons

Vue.component('sms-icon', require('src/components/icons/notifications/sms-icon').default)
Vue.component('system-update-icon', require('src/components/icons/notifications/system-update-icon').default)
Vue.component('call-icon', require('src/components/icons/notifications/call-icon').default)
Vue.component('call-voicemail-icon', require('src/components/icons/notifications/call-voicemail-icon').default)
Vue.component('voicemail-icon', require('src/components/icons/notifications/voicemail-icon').default)
Vue.component('mention-icon', require('src/components/icons/notifications/mention-icon').default)
Vue.component('call-incoming-icon', require('src/components/icons/notifications/call-incoming-icon').default)
