<template>
  <div class="broadcast-add broadcast-add__preview">
    <div class="broadcast-add__preview__row">
      <div class="broadcast-add__preview__row__label">To</div>
      <div class="broadcast-add__preview__row__field">
        {{ sourceText }} ({{ contactsText }})
      </div>
    </div>

    <div class="broadcast-add__preview__row">
      <div class="broadcast-add__preview__row__label">From</div>
      <div class="broadcast-add__preview__row__field">
        {{ campaignText }}
      </div>
    </div>

    <div class="broadcast-add__preview__row">
      <div class="broadcast-add__preview__row__label">Message</div>
      <div class="broadcast-add__preview__row__field">
        <div class="broadcast-add__preview__row__field__sms-preview"
             v-if="type === 'sms'">
          <message-composer-sms-preview :contact="contact"/>
        </div>
        <div class="broadcast-add__preview__row__field__rvm-preview"
             v-else-if="type === 'rvm'">
          <waveform unique-id="broadcast-rvm-preview"
                    :remote-url="rvmUrl" />
        </div>
      </div>
    </div>

    <div class="broadcast-add__preview__row">
      <div class="broadcast-add__preview__row__label">Schedule</div>
      <div class="broadcast-add__preview__row__field">
        Send at {{ scheduleText }}
        <b-badge class="ml-2"
                 variant="light">
          {{ companyTimezone }}
        </b-badge>
      </div>
    </div>

    <div class="broadcast-add__preview__row">
      <div class="broadcast-add__preview__row__label">Throttling</div>
      <div class="broadcast-add__preview__row__field">
        {{ throttle }}
      </div>
    </div>
  </div>
</template>

<script>
import MessageComposerSmsPreview from 'src/components/message-composer/message-composer-sms-preview.vue'
import Waveform from 'src/components/waveform.vue'
import { mapState } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view-preview',

  components: {
    MessageComposerSmsPreview,
    Waveform
  },

  props: {
    contact: {
      type: Object,
      required: true
    },

    campaign: {
      type: Object,
      required: true
    },

    contactsLength: {
      type: Number,
      required: true
    },

    date: {
      type: String,
      required: true
    },

    source: {
      type: Object,
      required: true
    },

    throttle: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    rvm: {
      type: Object,
      required: false
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    isValid () {
      return true
    },

    sourceText () {
      if (!isEmpty(this.source.list)) {
        return this.source.list.name
      }

      if (!isEmpty(this.source.filters)) {
        return 'Custom filters'
      }

      // FIXME: to be implemented
      // if (!isEmpty(this.source.integration)) {
      // }

      return ''
    },

    campaignText () {
      return `${this.campaign.name} (${this.campaign.incoming_number})`
    },

    contactsText () {
      return this.contactsLength + (this.contactsLength === 1 ? ' Contact' : ' Contacts')
    },

    scheduleText () {
      const format = window.moment().format('YYYY-MM-DD') === this.date.substr(0, 10)
        ? 'hh:mm a'
        : 'MM/DD/YYYY hh:mm a'

      return window.moment(this.date).format(format)
    },

    companyTimezone () {
      return window.moment().tz(this.currentCompany.timezone).format('z')
    },

    rvmUrl () {
      return `${window.axios.defaults.baseURL}/static/uploaded_file/${this.rvm.file_name}`
    }
  }
}
</script>
