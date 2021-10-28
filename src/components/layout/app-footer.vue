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
            :color="isActive('inbox') ? '#2F80ED' : '#A3A3A3'"/>
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
            :color="tab === 'contacts' ? '#2F80ED' : '#A3A3A3'"/>
        </span>
        Contacts
      </q-route-tab>
      <q-route-tab name="power-dialer"
                   to="/power-dialer"
                   :content-class="isActive('power-dialer') ? 'tab-icons xs-text tab-active' : 'tab-icons xs-text'"
                   :ripple="false"
                   :active="isActive('power-dialer')"
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
                   :active="isActive('stats')"
                   no-caps
                   exact>
        <span class="tab-icon">
          <stats-mobile-icon
            :color="tab === 'stats' ? '#2F80ED' : '#A3A3A3'"/>
        </span>
        Stats
      </q-route-tab>
      <q-route-tab name="more"
                   to=""
                   :id="'mobile-menu-item-more'"
                   :content-class="moreContentClass"
                   :ripple="false"
                   :active="isMoreActive"
                   no-caps
                   exact>
        <span class="tab-icon">
          <more-mobile-icon/>
        </span>
        More
      </q-route-tab>
    </q-tabs>
    <b-popover
      target="mobile-menu-item-more"
      triggers="click blur"
      placement="bottomright"
      boundary="window"
      custom-class="contact-popover mobile-more-dropdown"
      @hidden="onCloseDropdown"
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
export default {
  name: 'app-footer',
  components: {
    PowerDialerMobileIcon,
    MoreMobileIcon,
    StatsMobileIcon,
    ContactsMobileIcon,
    InboxMobileIcon,
    ContactMenu,
    ContactMenuItem
  },

  computed: {
    isMoreActive () {
      return this.tab === 'more'
    },
    moreContentClass () {
      return !this.isMoreActive ? 'tab-inactive tab-icons xs-text' : 'tab-icons xs-text'
    }
  },
  data () {
    return {
      tab: 'inbox'
    }
  },

  created () {
    this.tab = 'inbox'
  },

  methods: {
    isActive (tab) {
      return this.tab === tab
    },
    onCloseDropdown () {
      this.updateTab()
    },
    updateTab () {
      console.log('test')
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
  },

  watch: {
    'tab': function () {
      if (!this.tab) {
        this.tab = 'inbox'
      }
      if (this.tab === 'more' && this.$route.name) {
        this.updateTab()
      }
    },
    '$route.name': function () {
      this.updateTab()
    }
  }
}
</script>
