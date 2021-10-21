<template>
  <div>
    <q-tabs v-model="tab"
            active-color="positive"
            indicator-color="transparent"
            align="justify"
            :breakpoint="0"
            class="light text-grey footer-tabs"
            content-class="q-tabs__content--align-justify"
            dense>
      <q-route-tab name="inbox"
                   to="/"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <inbox-mobile-icon/>
        </span>
        Inbox
      </q-route-tab>
      <q-route-tab name="contacts"
                   to="/contacts"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <contacts-mobile-icon/>
        </span>
        Contacts
      </q-route-tab>
      <q-route-tab to="/"
                   :ripple="false"
                   class="tab-icons xs-text"
                   no-caps
                   exact>
        <span class="tab-icon">
          <keypad-mobile-icon/>
        </span>
        Keypad
      </q-route-tab>
      <q-route-tab name="stats"
                   to="/stats"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <stats-mobile-icon/>
        </span>
        Stats
      </q-route-tab>
      <q-route-tab name="settings"
                   to="/settings"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <more-mobile-icon/>
        </span>
        More
      </q-route-tab>
    </q-tabs>
  </div>
</template>

<script>
import InboxMobileIcon from 'components/icons/mobile-menu/inbox-mobile-icon'
import ContactsMobileIcon from 'components/icons/mobile-menu/contacts-mobile-icon'
import KeypadMobileIcon from 'components/icons/mobile-menu/keypad-mobile-icon'
import StatsMobileIcon from 'components/icons/mobile-menu/stats-mobile-icon'
import MoreMobileIcon from 'components/icons/mobile-menu/more-mobile-icon'
export default {
  name: 'app-footer',
  components: { MoreMobileIcon, StatsMobileIcon, KeypadMobileIcon, ContactsMobileIcon, InboxMobileIcon },
  data () {
    return {
      tab: 'inbox'
    }
  },

  watch: {
    '$route.name': function () {
      // this.initIcons()
    }
  }
}
</script>
