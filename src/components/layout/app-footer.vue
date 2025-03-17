<template>
  <div>
    <q-tabs active-color="positive"
            indicator-color="transparent"
            align="justify"
            class="light text-grey footer-tabs"
            content-class="q-tabs__content--align-justify"
            :breakpoint="600"
            dense
            v-model="tab">
      <q-route-tab name="inbox"
                   to="/"
                   :content-class="tab === 'inbox' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'inbox'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <inbox-mobile-icon :color="isActive('inbox') ? '#256EFF' : '#A3A3A3'" />
        </span>
        {{ INBOXES_MENU_TITLE }}
      </q-route-tab>
      <q-route-tab name="team-inboxes"
                   to="/team-inboxes"
                   :content-class="tab === 'team-inboxes' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'team-inboxes'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <e-inbox-mobile-icon :color="isActive('team-inboxes') ? '#256EFF' : '#A3A3A3'" />
        </span>
        {{ EINBOXES_MENU_TITLE }}
      </q-route-tab>
      <q-route-tab name="communications"
                   :to="DEFAULT_COMMUNICATIONS_ROUTE_PATH"
                   :content-class="tab === 'communications' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'communications'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <communications-mobile-icon :color="isActive('communications') ? '#256EFF' : '#A3A3A3'" />
        </span>
        {{ COMMUNICATIONS_MENU_TITLE_MOBILE }}
      </q-route-tab>
      <q-route-tab name="contacts"
                   to="/contacts"
                   :content-class="tab === 'contacts' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'contacts'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <contacts-mobile-icon
            :color="tab === 'contacts' ? '#256EFF' : '#A3A3A3'"/>
        </span>
        Contacts
      </q-route-tab>
      <q-route-tab name="phone"
                   class="phone-tab"
                   :class="inProgressAndParkedCallClass"
                   to="/phone"
                   :content-class="tab === 'phone' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'phone'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <mobile-phone-icon
            :color="tab === 'phone' ? 'primary' : 'grey-30'"/>
        </span>
        Phone
      </q-route-tab>
      <template v-if="false">
        <q-route-tab name="power-dialer-disabled"
                     content-class="tab-icons xs-text text-grey-5"
                     :ripple="false"
                     no-caps
                     v-if="!profile.auto_dialer_enabled">
          <span class="tab-icon"
                @click="toggleProFeatureDialog(true)">
            <q-badge floating
                     rounded
                     color="orange">
            </q-badge>
            <power-dialer-mobile-icon
              color="#BDBDBD"/>
          </span>
          Power Dialer
        </q-route-tab>
        <q-route-tab name="power-dialer"
                     to="/power-dialer"
                     :content-class="tab === 'power-dialer' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                     :ripple="false"
                     :active="tab === 'power-dialer'"
                     no-caps
                     exact
                     v-else>
          <span class="tab-icon">
            <q-badge floating
                     rounded
                     color="orange">
            </q-badge>
            <power-dialer-mobile-icon
              :color="tab === 'power-dialer' ? '#256EFF' : '#A3A3A3'"/>
          </span>
          Power Dialer
        </q-route-tab>
        <q-route-tab name="calendar-disabled"
                     content-class="tab-icons xs-text text-grey-5"
                     :ripple="false"
                     no-caps>
          <span class="tab-icon"
                @click="toggleProFeatureDialog(true)">
            <q-badge floating
                     rounded
                     color="orange">
            </q-badge>
            <calendar-mobile-icon color="#BDBDBD"/>
          </span>
          Calendar
        </q-route-tab>
      </template>
      <q-route-tab name="stats"
                   to="/stats"
                   :content-class="tab === 'stats' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'stats'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <stats-mobile-icon
            :color="tab === 'stats' ? '#256EFF' : '#A3A3A3'"/>
        </span>
        Stats
      </q-route-tab>
      <q-route-tab name="settings"
                   to="/settings"
                   :content-class="tab === 'settings' ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text text-grey'"
                   :ripple="false"
                   :active="tab === 'settings'"
                   no-caps
                   exact>
        <span class="tab-icon">
          <settings-mobile-icon
            width="22"
            height="22"
            :color="tab === 'settings' ? '#256EFF' : '#A3A3A3'"/>
        </span>
        Settings
      </q-route-tab>
      <q-tab name="more"
             :content-class="moreContentClass"
             :ripple="false"
             :active="isMoreActive"
             exact
             no-caps
             v-show="false"
             :id="'mobile-menu-item-more'">
        <span class="tab-icon">
          <more-mobile-icon />
        </span>
        More
      </q-tab>
    </q-tabs>
    <b-popover
      target="mobile-menu-item-more"
      triggers="click blur"
      placement="bottomright"
      boundary="window"
      custom-class="contact-popover mobile-more-dropdown"
      @hidden="onCloseDropdown"
      @show="tab='more'"
    >
      <contact-menu class="list-actions">
        <contact-menu-item @click="$emit('rename')">
          <!--template slot="icon">
            <pencil-icon></pencil-icon>
          </template-->
          <template slot="title">
            <span>Test 1</span>
          </template>
        </contact-menu-item>
      </contact-menu>
      <contact-menu class="list-actions">
        <contact-menu-item @click="$emit('rename')">
          <!--template slot="icon">
            <pencil-icon></pencil-icon>
          </template-->
          <template slot="title">
            <span>Test 2</span>
          </template>
        </contact-menu-item>
      </contact-menu>
    </b-popover>
  </div>
</template>

<script>
import InboxMobileIcon from 'components/icons/mobile-menu/inbox-mobile-icon'
import EInboxMobileIcon from 'components/icons/mobile-menu/einbox-mobile-icon'
import CommunicationsMobileIcon from 'components/icons/mobile-menu/communications-mobile-icon'
import ContactsMobileIcon from 'components/icons/mobile-menu/contacts-mobile-icon'
import StatsMobileIcon from 'components/icons/mobile-menu/stats-mobile-icon'
import MoreMobileIcon from 'components/icons/mobile-menu/more-mobile-icon'
import PowerDialerMobileIcon from 'components/icons/mobile-menu/power-dialer-mobile-icon'
import ContactMenu from 'components/contacts/contact-menu.vue'
import ContactMenuItem from 'components/contacts/contact-menu-item.vue'
import MobilePhoneIcon from 'components/icons/mobile-phone-icon'
import SettingsMobileIcon from 'components/icons/mobile-menu/settings-mobile-icon'
import CalendarMobileIcon from 'components/icons/mobile-menu/calendar-mobile-icon.vue'
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import {
  COMMUNICATIONS_MENU_TITLE_MOBILE,
  DEFAULT_COMMUNICATIONS_ROUTE_PATH,
  INBOXES_MENU_TITLE,
  EINBOXES_MENU_TITLE,
  EINBOXES_MENU_ITEMS,
  EINBOXES_MENU_COMMUNICATIONS
} from 'src/router/routes'
import { userMixin } from 'src/plugins/mixins'

export default {
  name: 'app-footer',
  components: {
    SettingsMobileIcon,
    MobilePhoneIcon,
    PowerDialerMobileIcon,
    MoreMobileIcon,
    StatsMobileIcon,
    ContactsMobileIcon,
    InboxMobileIcon,
    EInboxMobileIcon,
    CommunicationsMobileIcon,
    ContactMenu,
    ContactMenuItem,
    CalendarMobileIcon
  },

  mixins: [
    userMixin
  ],

  computed: {
    ...mapState([
      'isMobile',
      'dialer',
      'showPhone',
      'parkedCalls'
    ]),
    ...mapState('auth', ['profile']),
    isMoreActive () {
      return this.tab === 'more'
    },
    moreContentClass () {
      return !this.isMoreActive ? 'tab-inactive tab-icons xs-text' : 'tab-active tab-icons xs-text'
    },
    isPhoneActive () {
      return this.tab === 'phone'
    },
    inProgressAndParkedCallClass () {
      if (this.tab === 'phone') {
        return ''
      }

      if (!_.isEmpty(this.dialer.call) && !['RECEIVED_CALL_INVITE', 'WRAP_UP'].includes(this.dialer.currentStatus)) {
        return ['green-phone']
      }

      if (this.parkedCalls.length) {
        return ['purple-phone']
      }

      return []
    }
  },
  data () {
    return {
      tab: 'inbox',
      DEFAULT_COMMUNICATIONS_ROUTE_PATH,
      INBOXES_MENU_TITLE,
      EINBOXES_MENU_TITLE,
      EINBOXES_MENU_ITEMS,
      EINBOXES_MENU_COMMUNICATIONS,
      COMMUNICATIONS_MENU_TITLE_MOBILE,
      parkedCallQueue: []
    }
  },

  mounted () {
    // this.updateTab()
    // this.tab = !this.dialer.currentStatus || this.dialer.currentStatus !== 'READY' ? 'phone' : this.tab
  },

  methods: {
    ...mapActions('contacts', ['setShowContactsHeader']),
    ...mapActions(['setShowPhone', 'toggleProFeatureDialog']),
    isActive (tab) {
      return this.tab === tab
    },
    onCloseDropdown () {
      // this.updateTab()
    },
    getTab () {
      if (['Inbox'].includes(this.$route.name) && this.$q.screen.lt.md) {
        this.setShowContactsHeader(false)
      }

      if (['Contacts', 'Phone', 'Stats', 'Power Dialer', 'Settings', 'Settings Tab'].includes(this.$route.name)) {
        this.setShowContactsHeader(true)
      }

      switch (this.$route.name) {
        case 'Communications':
        case 'Communications Channel':
        case 'Communications Contact Task':
        case 'Communications Channel Task Status':
          return 'communications'
        case 'Inbox':
        case 'Inbox Channel':
        case 'Inbox Contact':
        case 'Inbox Contact Task':
        case 'Inbox Channel Task Status':
        case 'Inbox Contact Communication':
          return 'inbox'
        case EINBOXES_MENU_TITLE:
        case EINBOXES_MENU_ITEMS:
        case EINBOXES_MENU_COMMUNICATIONS:
          return 'team-inboxes'
        case 'Contacts':
        case 'Contact':
          return 'contacts'
        case 'Phone':
          return 'phone'
        case 'Power Dialer':
          return 'power-dialer'
        case 'Calendar':
          return 'calendar'
        case 'Stats':
          return 'stats'
        case 'Settings':
        case 'Settings Tab':
          return 'settings'
      }
    },
    updateTab (forceTab = null) {
      if (!forceTab) {
        this.tab = this.getTab()
      } else {
        this.tab = forceTab
      }

      if (this.tab !== 'phone' && this.showPhone) {
        this.setShowPhone(false)
      }
    },
    toggleContacts () {
      this.tab = 'contacts'
    }
  },

  watch: {
    'tab': _.debounce(function (newValue, oldValue) {
      if (!newValue) {
        this.tab = 'inbox'
      }

      if (this.tab === 'phone') {
        this.$emit('toggleMobilePhone', true)
        return
      }

      if (this.tab === 'more') {
        return
      }

      if (oldValue === 'phone') {
        this.$emit('toggleMobilePhone', false)
      }

      const tab = this.getTab()
      if (this.tab !== tab) {
        this.tab = tab
      }
    }, 100),
    'showPhone': function () {
      if (this.showPhone) {
        this.tab = 'phone'
      }
    },
    '$route.name': function () {
      if (this.tab !== 'phone') {
        this.setShowPhone(false)
      }
    }
  }
}
</script>
