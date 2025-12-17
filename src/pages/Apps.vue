<template>
  <div class="h-100">
    <upgrade-now-page class="mt-5"
                      extra-text2="👇"
                      image-link="/assets/images/logo.png"
                      title-text="Open with our desktop app"
                      :extra-text="`Phone: ${phoneNumber}`"
                      :show-button="false"
                      :text="getActionText"
    />

    <!-- display a banner with empashis with the getActionText if the
    action is not allowed -->
    <div class="q-pa-md q-gutter-sm d-flex justify-content-center"
         v-if="!isAllowedActions">
      <q-banner inline-actions
                rounded
                class="bg-orange text-white">
        <span class="font-weight-bolder"> {{ getActionText }} </span>
      </q-banner>
    </div>

    <!-- HERE BUTTON TO OPEN DEEP LINK -->
    <div class="d-flex justify-content-center mt-3"
         v-else>
      <q-btn class="q-mt-xl px-4"
             label="Open App"
             color="primary"
             no-caps
             unelevated
             @click="openDeepLink" />
    </div>
  </div>
</template>

<script>
import UpgradeNowPage from 'src/components/upgrade-now-page.vue'

const OPEN_CONTACT_ACTION = 'open-contact'
const CALL_ACTION = 'call'

const AVAILABLE_ACTIONS = [OPEN_CONTACT_ACTION, CALL_ACTION]

const OPEN_CONTACT_DESCRIPTION = 'Opening the contact...'
const CALL_DESCRIPTION = 'Calling...'

const ALOWARE_PROTOCOL = 'alowaretalk://'

export default {
  name: 'Apps',

  components: {
    UpgradeNowPage
  },
  // get action and phone from get params
  props: {
    action: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    isCompany: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    getActionText () {
      if (this.isContactAction) {
        return OPEN_CONTACT_DESCRIPTION
      }

      if (this.isCallAction) {
        return CALL_DESCRIPTION
      }

      return "We couldn't find the action you are looking for"
    },
    isCallAction () {
      return this.action === CALL_ACTION
    },
    isContactAction () {
      return this.action === OPEN_CONTACT_ACTION
    },
    isAllowedActions () {
      return AVAILABLE_ACTIONS.includes(this.action)
    }
  },
  methods: {
    async openDeepLink () {
      // Open deep link
      if (!this.isAllowedActions) {
        return
      }

      let deepLink = `${ALOWARE_PROTOCOL}${this.action}-${this.phoneNumber}`
      const params = new URLSearchParams()
      if (this.firstName) {
        params.append('first_name', this.firstName)
      }
      if (this.lastName) {
        params.append('last_name', this.lastName)
      }
      if (this.isCompany === 'true') {
        params.append('is_company', 'true')
      }
      if (params.toString()) {
        deepLink += `?${params.toString()}`
      }

      const opened = await window.open(deepLink, '_blank')
      if (opened) {
        window.close()
      }
    }
  },

  mounted () {
    this.openDeepLink()
  }
}
</script>
