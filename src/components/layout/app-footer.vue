<template>
  <div>
    <q-tabs
      v-model="tab"
      :breakpoint="600"
      active-color="positive"
      align="justify"
      class="light text-grey footer-tabs"
      content-class="q-tabs__content--align-justify"
      dense
      indicator-color="transparent"
    >
      <app-footer-nav-link
        :isActive="tab === 'team-inboxes'"
        :title="TEAMINBOXES_MENU_TITLE" :to="{name: 'Team Inboxes'}"
      >
        <template v-slot:icon="{active}">
          <team-inbox-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        :isActive="tab === 'communications'"
        :title="COMMUNICATIONS_MENU_TITLE_MOBILE"
        :to="{name: 'Communications', path: DEFAULT_COMMUNICATIONS_ROUTE_PATH}"
      >
        <template v-slot:icon="{active}">
          <communications-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        :isActive="tab === 'contacts'"
        :to="{name: 'Contacts'}" title="Contacts"
      >
        <template v-slot:icon="{active}">
          <contacts-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        :isActive="tab === 'phone'"
        :to="{name: 'Phone'}" title="Phone"
      >
        <template v-slot:icon="{active}">
          <mobile-phone-icon :color="active ? 'primary' : 'grey-30'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        v-if="$store.state.auth.is_focused_power_dialer"
        :isActive="tab === 'power-dialer'"
        :to="{name: 'Power Dialer'}" title="Power Dialer"
      >
        <template v-slot:icon="{active}">
          <power-dialer-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        v-if="false"
        :isActive="tab === 'calendar'"
        :to="{name: 'Calendar'}" title="Calendar"
      >
        <template v-slot:icon="{active}">
          <calendar-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        :isActive="tab === 'stats'"
        :to="{name: 'Stats'}" title="Stats"
      >
        <template v-slot:icon="{active}">
          <stats-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" />
        </template>
      </app-footer-nav-link>

      <app-footer-nav-link
        :isActive="tab === 'settings'"
        :to="{name: 'Settings'}" title="Settings"
      >
        <template v-slot:icon="{active}">
          <settings-mobile-icon :color="active ? '#256EFF' : '#A3A3A3'" height="22" width="22" />
        </template>
      </app-footer-nav-link>

      <q-tab
        v-show="false"
        :id="'mobile-menu-item-more'"
        :active="isMoreActive"
        :content-class="moreContentClass"
        :ripple="false"
        exact
        name="more"
        no-caps
      >
        <span class="tab-icon">
          <more-mobile-icon />
        </span>
        More
      </q-tab>

    </q-tabs>

    <b-popover
      boundary="window"
      custom-class="contact-popover mobile-more-dropdown"
      placement="bottomright"
      target="mobile-menu-item-more"
      triggers="click blur"
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
import TeamInboxMobileIcon from 'components/icons/mobile-menu/teaminbox-mobile-icon'
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
  TEAMINBOXES_MENU_COMMUNICATIONS_TITLE,
  TEAMINBOXES_MENU_ITEMS_TITLE,
  TEAMINBOXES_MENU_TITLE
} from 'src/router/routes'
import { userMixin } from 'src/plugins/mixins'
import AppFooterNavLink from 'components/layout/app-footer-nav-link.vue'

export default {
  name: 'app-footer',
  components: {
    AppFooterNavLink,
    SettingsMobileIcon,
    MobilePhoneIcon,
    PowerDialerMobileIcon,
    MoreMobileIcon,
    StatsMobileIcon,
    ContactsMobileIcon,
    TeamInboxMobileIcon,
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
      TEAMINBOXES_MENU_TITLE,
      TEAMINBOXES_MENU_ITEMS_TITLE,
      TEAMINBOXES_MENU_COMMUNICATIONS_TITLE,
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
      if (['Contacts', 'Phone', 'Stats', 'Power Dialer', 'Settings', 'Settings Tab'].includes(this.$route.name)) {
        this.setShowContactsHeader(true)
      }

      switch (this.$route.name) {
        case 'Communications':
        case 'Communications Channel':
        case 'Communications Contact Task':
        case 'Communications Channel Task Status':
          return 'communications'
        case TEAMINBOXES_MENU_TITLE:
        case TEAMINBOXES_MENU_ITEMS_TITLE:
        case TEAMINBOXES_MENU_COMMUNICATIONS_TITLE:
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
        this.tab = 'team-inboxes'
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
