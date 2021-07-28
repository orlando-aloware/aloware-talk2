<template>
  <q-toolbar class="page-header pl-3 pr-3">
    <div class="d-flex h-100 align-items-center">
      <b-link v-if="['Contact'].includes($route.name) && canGoBack" class="btn-header-nav-back mr-3"
              href="#"
              @click="navigateBackward">
        <i class="fa fa-chevron-left"></i>
      </b-link>

      <h1>{{ ['Contact'].includes($route.name) ? 'Search Result' : $route.name }}</h1>
    </div>
    <div class="ml-auto d-none d-lg-block h-100">
      <div class="d-flex h-100 align-items-center">
        <profile></profile>

        <phone></phone>

        <q-separator class="height-28 ml-3 mr-3 margin-auto position-relative"
                     vertical>
        </q-separator>

        <active-call></active-call>

        <q-item>
          <q-btn :ripple="false"
                 :icon="dialerIcon"
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
import { aclMixin, agentMixin, avatarMixin, goBackMixin } from 'src/plugins/mixins'

import DialerForm from 'components/dialer/dialer-form'
import ActiveCall from 'components/dialer/active-call'
import Profile from 'components/profile'
import Phone from 'components/dialer/phone'

export default {
  name: 'app-header',

  mixins: [aclMixin, avatarMixin, agentMixin, goBackMixin],

  components: { Phone, ActiveCall, DialerForm, Profile },

  data () {
    return {
      dialerIcon: 'img:app-icons/header/dialer_gray.svg',
      dialerStatus: false
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

    navigateBackward (e) {
      this.goBack()
      e.preventDefault()
    }
  }
}
</script>
