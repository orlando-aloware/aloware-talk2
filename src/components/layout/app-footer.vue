<template>
  <div>
    <q-tabs v-model="tab"
            active-color="positive"
            indicator-color="transparent"
            align="justify"
            :breakpoint="600"
            class="light text-grey footer-tabs"
            content-class="q-tabs__content--align-justify"
            dense>
      <q-route-tab name="inbox"
                   to="/"
                   :content-class="isActive('inbox') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <inbox-mobile-icon
            :color="isActive('inbox') ? '#2F80ED' : '#A3A3A3'"/>
        </span>
        Inbox
      </q-route-tab>
      <q-route-tab name="contacts"
                   to="/contacts"
                   :content-class="isActive('contacts') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <contacts-mobile-icon
            :color="tab === 'contacts' ? '#2F80ED' : '#A3A3A3'"/>
        </span>
        Contacts
      </q-route-tab>
      <q-route-tab to="/#"
                   :ripple="false"
                   :content-class="isActive('#') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <keypad-mobile-icon/>
        </span>
        Keypad
      </q-route-tab>
      <q-route-tab name="stats"
                   to="/stats"
                   :content-class="isActive('stats') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <power-dialer-mobile-icon
            :color="tab === 'stats' ? '#2F80ED' : '#A3A3A3'"/>
        </span>
        Power Dialer
      </q-route-tab>
      <q-route-tab name="stats"
                   to="/stats"
                   :content-class="isActive('stats') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   no-caps
                   exact>
        <span class="tab-icon">
          <stats-mobile-icon
            :color="tab === 'stats' ? '#2F80ED' : '#A3A3A3'"/>
        </span>
        Stats
      </q-route-tab>
      <q-route-tab name="settings"
                   to="/settings"
                   :content-class="isActive('settings') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
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
import PowerDialerMobileIcon from 'components/icons/mobile-menu/power-dialer-mobile-icon'
export default {
  name: 'app-footer',
  components: { PowerDialerMobileIcon, MoreMobileIcon, StatsMobileIcon, KeypadMobileIcon, ContactsMobileIcon, InboxMobileIcon },
  data () {
    return {
      tab: 'inbox'
    }
  },

  created () {
    this.tab = 'inbox'
    console.log('test')
  },

  methods: {
    isActive (tab) {
      return this.tab === tab
    }
  },

  watch: {
    'tab': function () {
      if (!this.tab) {
        this.tab = 'inbox'
      }
    },
    '$route.name': function () {
      switch (this.$route.name) {
        case 'Inbox':
        case 'Inbox Channel':
        case 'Inbox Contact':
        case 'Inbox Contact Task':
        case 'Inbox Channel Task Status':
        case 'Inbox Contact Mention Communication':
          this.tab = 'inbox'
          break
        case 'Contacts':
          this.tab = 'contacts'
          break
        case 'Stats':
          this.tab = 'stats'
          break
      }
    }
  }
}
</script>
