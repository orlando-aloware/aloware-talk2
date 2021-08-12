<template>
  <q-toolbar class="page-header pl-3 pr-3">
    <div class="d-flex h-100 align-items-center">
      <b-link v-if="['Contact'].includes($route.name)" class="btn-header-nav-back mr-3"
              href="#"
              @click="navigateToContacts">
        <i class="fa fa-chevron-left"></i>
      </b-link>

      <h1 v-if="!['Contact'].includes($route.name)">{{ $route.meta && $route.meta.title ? $route.meta.title : $route.name }}</h1>
      <contact-app-header v-if="['Contact'].includes($route.name)"></contact-app-header>
      <contact-list-navigation v-if="['Contact'].includes($route.name)" />
    </div>
    <div class="ml-auto d-none d-lg-block h-100">
      <div class="d-flex h-100 align-items-center">
        <profile></profile>

        <phone></phone>

        <q-separator class="height-28 ml-3 mr-3 margin-auto position-relative"
                     vertical>
        </q-separator>

        <parked-call></parked-call>

        <active-call></active-call>

        <q-item>
          <q-btn :ripple="false"
                 :icon="dialerIcon"
                 :disable="!isDialerReady"
                 size="40px"
                 padding="none"
                 align="center"
                 flat>
            <q-menu :offset="[0, 10]"
                    anchor="bottom end"
                    self="top right"
                    v-model="dialerStatus"
                    persistent
                    @before-show="showDialer"
                    @before-hide="hideDialer">
              <dialer-form v-model="dialerStatus"
                           @hide="hideDialer">
              </dialer-form>
            </q-menu>
          </q-btn>
        </q-item>
      </div>
    </div>
    <div class="ml-auto d-block d-sm-none">
      <div class="d-flex h-100 align-items-center">

      </div>
    </div>
  </q-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { aclMixin, avatarMixin, goBackMixin } from 'src/plugins/mixins'
import DialerForm from 'components/dialer/dialer-form'
import ActiveCall from 'components/dialer/active-call'
import Profile from 'components/profile'
import Phone from 'components/dialer/phone'
import ContactListNavigation from 'components/contacts/contact-list-navigation'
import ContactAppHeader from 'components/contacts/contact-app-header'
import ParkedCall from 'components/dialer/parked-call'

export default {
  name: 'app-header',

  mixins: [aclMixin, avatarMixin, goBackMixin],

  components: { ParkedCall, ContactAppHeader, ContactListNavigation, Phone, ActiveCall, DialerForm, Profile },

  data () {
    return {
      dialerIcon: 'img:app-icons/header/dialer_gray.svg',
      dialerStatus: false
    }
  },

  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapState('contacts', ['selectedList']),
    ...mapState(['dialer']),

    isDialerReady () {
      return !this.dialer.call && this.dialer.isReady
    }
  },

  created () {
    this.$VueEvent.listen('callContact', (data) => {
      this.showDialer()
      setTimeout(() => {
        this.$VueEvent.fire('changePhoneNumber', data)
      }, 100)
    })
  },

  methods: {
    toggleSidebar () {
      this.$emit('toggleSidebar')
    },

    showDialer () {
      this.dialerIcon = 'img:app-icons/header/dialer_active.svg'
      this.dialerStatus = true
    },

    hideDialer () {
      this.dialerIcon = 'img:app-icons/header/dialer_gray.svg'
      this.dialerStatus = false
    },

    navigateToContacts (e) {
      if (this.selectedList.id.toString() === 'all') {
        this.$router.push({
          name: 'Contacts'
        })
      } else {
        this.$router.push({
          path: `list/${this.selectedList.id}`
        })
      }
      e.preventDefault()
    }
  },

  watch: {
    authenticated () {
      if (!this.authenticated) {
        this.hideDialer()
      }
    }
  }
}
</script>
