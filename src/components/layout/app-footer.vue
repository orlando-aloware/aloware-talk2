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
                   label="Inbox"
                   to="/"
                   :icon="icons.inbox"
                   content-class="tab-icons"
                   :ripple="false"
                   no-caps
                   exact>
      </q-route-tab>
      <q-route-tab name="contacts"
                   label="Contacts"
                   to="/contacts"
                   :icon="icons.contacts"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
      </q-route-tab>
      <q-route-tab to="/"
                   icon="img:app-icons/menu/dialer.svg"
                   :ripple="false"
                   class="dialpad"
                   no-caps
                   exact>
      </q-route-tab>
      <q-route-tab name="settings"
                   label="Settings"
                   to="/settings"
                   :icon="icons.settings"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
      </q-route-tab>
      <q-route-tab name="account"
                   label="Account"
                   to="/account"
                   :icon="icons.account"
                   content-class="tab-icons xs-text"
                   :ripple="false"
                   no-caps
                   exact>
      </q-route-tab>
    </q-tabs>
    <div class="w-100 d-flex justify-content-center">
      <q-separator class="separator mt-1"
                   color="black"
                   size="5px" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'app-footer',
  data () {
    return {
      tab: 'inbox',
      icons: {
        inbox: '',
        contacts: '',
        settings: '',
        account: ''
      }
    }
  },

  created () {
    this.initIcons()
  },

  methods: {
    initIcons () {
      for (let key in this.icons) {
        this.setIcon(key)
      }
    },

    setIcon (icon) {
      let page = null
      if (this.$route.name) {
        page = this.$route.name.toLowerCase().replace(' ')
      }

      let iconState = page === icon ? 'active' : 'inactive'
      this.icons[icon] = 'img:app-icons/menu/' + iconState + '/' + icon + '.svg'
    }
  },

  watch: {
    '$route.name': function () {
      this.initIcons()
    }
  }
}
</script>
