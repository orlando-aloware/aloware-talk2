<template>
  <div>
    <q-tabs v-model="tab"
            active-color="positive"
            indicator-color="transparent"
            align="justify"
            :breakpoint="600"
            class="light text-grey footer-tabs"
            content-class="q-tabs__content--align-justify"
            dense
            @update="updateTab">
      <q-route-tab name="inbox"
                   to="/"
                   :content-class="isActive('inbox') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   :active="isActive('inbox')"
                   no-caps
                   exact>
        <span class="tab-icon">
          <inbox-mobile-icon
            :color="isActive('inbox') ? '#256EFF' : '#A3A3A3'"/>
        </span>
        Inbox
      </q-route-tab>
      <q-route-tab name="contacts"
                   to="/contacts"
                   :content-class="isActive('contacts') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   :active="isActive('contacts')"
                   no-caps
                   exact>
        <span class="tab-icon">
          <contacts-mobile-icon
            :color="tab === 'contacts' ? '#256EFF' : '#A3A3A3'"/>
        </span>
        Contacts
      </q-route-tab>
      <q-tab name="phone"
             :content-class="phoneContentClass"
             :ripple="false"
             :active="isPhoneActive"
             no-caps
             exact>
        <span class="tab-icon">
          <mobile-phone-icon
            :color="tab === 'phone' ? 'primary' : 'grey-30'"/>
        </span>
        Phone
      </q-tab>
      <q-route-tab name="power-dialer"
                   to="/power-dialer"
                   :content-class="isActive('power-dialer') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   :active="isActive('power-dialer')"
                   no-caps
                   exact>
        <span class="tab-icon">
          <power-dialer-mobile-icon
            :color="tab === 'power-dialer' ? '#256EFF' : '#A3A3A3'"/>
        </span>
        Power Dialer
      </q-route-tab>
      <q-route-tab name="stats"
                   to="/stats"
                   :content-class="isActive('stats') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   :active="isActive('stats')"
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
                   :content-class="isActive('settings') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   :active="isActive('settings')"
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
             :id="'mobile-menu-item-more'"
             :content-class="moreContentClass"
             :ripple="false"
             :active="isMoreActive"
             v-show="false"
             no-caps
             exact>
        <span class="tab-icon">
          <more-mobile-icon/>
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
import ContactsMobileIcon from 'components/icons/mobile-menu/contacts-mobile-icon'
import StatsMobileIcon from 'components/icons/mobile-menu/stats-mobile-icon'
import MoreMobileIcon from 'components/icons/mobile-menu/more-mobile-icon'
import PowerDialerMobileIcon from 'components/icons/mobile-menu/power-dialer-mobile-icon'
import ContactMenu from 'components/contacts/contact-menu.vue'
import ContactMenuItem from 'components/contacts/contact-menu-item.vue'
import MobilePhoneIcon from 'components/icons/mobile-phone-icon'
import SettingsMobileIcon from 'components/icons/mobile-menu/settings-mobile-icon'
import { mapActions, mapState } from 'vuex'
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
    ContactMenu,
    ContactMenuItem
  },

  computed: {
    ...mapState(['isMobile', 'dialer']),

    isMoreActive () {
      return this.tab === 'more'
    },
    moreContentClass () {
      return !this.isMoreActive ? 'tab-inactive tab-icons xs-text' : 'tab-active tab-icons xs-text'
    },
    isPhoneActive () {
      return this.tab === 'phone'
    },
    phoneContentClass () {
      return `menu-phone ${!this.isPhoneActive ? 'tab-inactive tab-icons xs-text' : 'tab-active tab-icons xs-text'}`
    }
  },
  data () {
    return {
      tab: 'inbox'
    }
  },

  mounted () {
    this.updateTab()
    this.tab = !this.dialer.currentStatus || this.dialer.currentStatus !== 'READY' ? 'phone' : this.tab

    this.$VueEvent.listen('answerCall', () => {
      if (this.isMobile) {
        this.tab = 'phone'
      }
    })
  },

  methods: {
    ...mapActions('contacts', ['setShowContactsHeader']),
    isActive (tab) {
      return this.tab === tab
    },
    onCloseDropdown () {
      this.updateTab()
    },
    getTab () {
      if (['Contact', 'Inbox'].includes(this.$route.name)) {
        this.setShowContactsHeader(false)
      }

      if (['Contacts', 'Stats', 'Power Dialer', 'Settings', 'Settings Tab'].includes(this.$route.name)) {
        this.setShowContactsHeader(true)
      }

      switch (this.$route.name) {
        case 'Inbox':
        case 'Inbox Channel':
        case 'Inbox Contact':
        case 'Inbox Contact Task':
        case 'Inbox Channel Task Status':
        case 'Inbox Contact Mention Communication':
          return 'inbox'
        case 'Contacts':
        case 'Contact':
          return 'contacts'
        case 'Power Dialer':
          return 'power-dialer'
        case 'Stats':
          return 'stats'
        case 'Settings':
        case 'Settings Tab':
          return 'settings'
      }
    },
    updateTab () {
      this.tab = this.getTab()
    },

    toggleContacts () {
      this.tab = 'contacts'
    }
  },

  watch: {
    'tab': function (newValue, oldValue) {
      if (!newValue) {
        this.tab = 'inbox'
      }

      if (this.dialer.currentStatus && this.dialer.currentStatus !== 'READY') {
        this.$emit('toggleMobilePhone', true)
        return
      }

      if (this.tab === 'more') {
        return
      }

      if (newValue === 'phone') {
        this.$emit('toggleMobilePhone', true)
        return
      }

      if (oldValue === 'phone') {
        this.$emit('toggleMobilePhone', false)
      }

      if (this.tab !== this.getTab()) {
        this.updateTab()
      }
    },

    '$route.name': function () {
      this.updateTab()
    },

    'isMobile': function () {
      if (this.isMobile && (this.dialer.currentStatus && this.dialer.currentStatus !== 'READY')) {
        this.tab = 'phone'
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('answerCall')
  }
}
</script>
