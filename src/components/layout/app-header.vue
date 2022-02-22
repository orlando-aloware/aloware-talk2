<template>
  <q-toolbar class="page-header"
             :class="{ 'pl-3 pr-3': !noPadding }">
    <div class="d-flex h-100 align-items-center">
      <back-button class="mobile-back-btn-global-header"
                   v-if="['Contact', 'Settings Tab'].includes($route.name)"
                   @click="navigateBack"/>
      <!--b-link v-if="['Contact', 'Settings Tab'].includes($route.name)"
              class="btn-header-nav-back mr-3"
              href="#"
              @click="navigateBack">
        <i class="fa fa-chevron-left"></i>
      </b-link-->

      <router-link
        class="btn-header-nav-back"
        v-if="['Communication'].includes($route.name)"
        :to="{ name: 'Contact', params: { id: $route.params.contactId }}">
        <button class="more-details font-weight-light-bold btn btn-sm">
          <i class="fa fa-chevron-left"></i>
        </button>
      </router-link>
      <h1 v-if="isMainTitle">{{ $route.meta && $route.meta.title ? $route.meta.title : $route.name }}</h1>
      <h1 v-if="forcePageTitle">{{ forcePageTitle }}</h1>
      <h1 v-if="$q.screen.lt.md && ['Settings Tab'].includes($route.name)">{{ $route.params.tab.replace('-', ' ') | ucwords }}</h1>
      <contact-app-header v-if="['Contact'].includes($route.name) && !titleOnly"></contact-app-header>
      <contact-list-navigation v-if="['Contact'].includes($route.name) && !titleOnly" />
      <inbox-list-navigation v-if="(['Inbox', 'Inbox Contact Task'].includes($route.name) || ['/channels/inbox/open', '/channels/inbox/pending', '/channels/inbox/closed'].includes($route.path)) && !titleOnly" />
      <inbox-channel-navigation v-if="(['Inbox Contact', 'Inbox Contact Mention Communication', 'Inbox Channel'].includes($route.name) || ['/channels/mentions/received', '/channels/mentions/sent'].includes($route.path)) && !titleOnly" />

      <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center"
                   v-if="$route.name === 'Stats' && !titleOnly"
                   :disabled="loading"
                   @clicked="refreshMetricGroup">
        <refresh-icon />
        Refresh
      </compact-btn>
    </div>
    <!--div class="ml-auto d-none d-lg-block h-100"-->
    <div class="ml-auto d-block h-100">
      <div class="d-flex h-100 align-items-center">

        <shared-login-menu v-if="!isElectron"></shared-login-menu>

        <profile></profile>

        <phone v-if="!isMobile"></phone>

        <q-separator class="height-28 ml-3 mr-3 margin-auto position-relative"
                     vertical>
        </q-separator>

        <parked-call v-if="!isMobile"></parked-call>

        <active-call v-if="!isMobile"></active-call>

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
                           v-if="!isMobile"
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
import _ from 'lodash'
import { Platform } from 'quasar'
import { mapActions, mapGetters, mapState } from 'vuex'
import { aclMixin, avatarMixin, goBackMixin } from 'src/plugins/mixins'
import DialerForm from 'components/dialer/dialer-form'
import ActiveCall from 'components/dialer/active-call'
import Profile from 'components/profile'
import Phone from 'components/dialer/phone'
import CompactBtn from 'components/compact-btn'
import ContactListNavigation from 'components/contacts/contact-list-navigation'
import ContactAppHeader from 'components/contacts/contact-app-header'
import ParkedCall from 'components/dialer/parked-call'
import InboxListNavigation from 'components/inbox/inbox-list-navigation'
import InboxChannelNavigation from 'components/inbox/inbox-channel-navigation'
import RefreshIcon from 'components/icons/refresh-icon'
import SharedLoginMenu from 'components/shared-login-menu'
import BackButton from 'components/back-button'

export default {
  name: 'app-header',

  mixins: [aclMixin, avatarMixin, goBackMixin],

  components: {
    BackButton,
    SharedLoginMenu,
    InboxChannelNavigation,
    InboxListNavigation,
    ParkedCall,
    ContactAppHeader,
    ContactListNavigation,
    Phone,
    ActiveCall,
    DialerForm,
    Profile,
    CompactBtn,
    RefreshIcon
  },

  props: {
    forcePageTitle: {
      type: String,
      default: ''
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    titleOnly: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      dialerIcon: 'img:app-icons/header/dialer_gray.svg',
      dialerStatus: false,
      loading: false,
      prevRoute: null
    }
  },

  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },

  computed: {
    ...mapGetters('auth', ['authenticated', 'profile']),
    ...mapState('contacts', ['selectedList']),
    ...mapState('stats', ['metricLoader', 'groupMetricLoader']),
    ...mapState(['dialer', 'dialerFormStatus', 'isMobile']),

    isDialerReady () {
      return !this.dialer.call && this.dialer.isReady
    },
    isElectron () {
      return Platform.is.electron
    },
    isMainTitle () {
      if (['Settings Tab'].includes(this.$route.name) && !this.$q.screen.lt.md) {
        return true
      }

      if (['Settings Tab'].includes(this.$route.name) && this.$q.screen.lt.md) {
        return false
      }

      return !['Contact'].includes(this.$route.name) && !this.forcePageTitle
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

    navigateToContactActivity () {
      this.$router.push({
        name: 'Communication',
        params: {
          contactId: this.$route.params.contactId
        }
      })
    },

    navigateBack (e) {
      const previousPage = _.get(this.$route.query, 'previousPage', null)

      if (previousPage === 'PowerDialer') {
        this.$router.push({
          path: this.$router.history._startLocation
        })
      }

      if (this.$route.name === 'Settings Tab') {
        this.$router.back()
        return
      }

      if (this.selectedList.id.toString() === 'all') {
        this.$router.push({
          name: 'Contacts'
        })
      } else {
        this.$router.push({
          path: `list/${this.selectedList.id}`
        })
      }

      if (e) {
        e.preventDefault()
      }
    },

    refreshMetricGroup () {
      this.setMetricLoader(true)
      this.$axios
        .get(`/api/v2/agents/${this.profile.id}/statistics/metric-groups`, {
          params: {
            include_metrics: true
          }
        })
        .then(response => {
          this.setMetricLoader(false)
          this.setMetricGroups(response.data)
        })
        .catch((err) => {
          console.error(err)
          this.setMetricLoader(false)
          this.$generalNotification('Failed to fetch metric groups.', 'error')
        })
    },
    ...mapActions('stats', ['setMetricGroups', 'setMetricLoader']),
    ...mapActions(['setDialerFormStatus'])
  },

  watch: {
    authenticated () {
      if (!this.authenticated) {
        this.hideDialer()
      }
    },
    'isMobile': function () {
      if (this.isMobile) {
        this.dialerStatus = false
      }
    },
    metricLoader () {
      this.loading = this.metricLoader
    },
    groupMetricLoader () {
      this.loading = this.groupMetricLoader
    },
    dialerStatus () {
      this.setDialerFormStatus(this.dialerStatus)
    },
    dialerFormStatus () {
      this.dialerStatus = this.dialerFormStatus
    }
  }
}
</script>
