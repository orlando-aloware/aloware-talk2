<template>
  <q-item class="header-help-wrapper">
    <q-item-section class="nav-item dropdown"
                    v-if="!whitelabel && !loading_whitelabel && !isMobileSize">
      <q-btn-dropdown class="tab-dropdown"
                      ref="menu"
                      flat
                      :ripple="false"
                      :menu-offset="[4, 16]">
        <template v-slot:label>
                  <i class="fa fa-question-circle text-2x text-red-10 header-help-icon-wrapper"></i>
        </template>

        <q-list class="tab-dropdown-list p-3 allow-select">
          <span class="text-md"
                v-if="user.profile"
                @click="noClose($event)">
                Service code: <b>{{ user.profile.company_id }}-{{ user.profile.id }}</b>
          </span>
          <br>
          <span class="text-md"
                @click="noClose($event)">
            Role: <b>{{ user.profile.role_name }}</b>
          </span>
          <a v-if="!user.profile.company.reseller_id"
              class="btn btn-block bg-indigo-10 text-white mt-2"
              href="https://support.aloware.com"
              target="_blank">
            Get Help
          </a>
          <a v-if="!user.profile.company.reseller_id"
            class="btn btn-block bg-green-8 text-white"
            href="https://aloware.com/setup-guide"
            target="_blank">
            Setup Guide
          </a>
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </q-item>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import Roles from 'src/constants/roles'
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      env: null,
      branch: null,
      whitelabel: false,
      loading_whitelabel: true,
      window_size: null,
      Roles
    }
  },

  created () {
    this.getBuildInfo()

    // initialize window width size
    this.window_size = window.screen.width

    // Add listener to window resize
    window.addEventListener('resize', this.windowResize)

    this.getWhitelabelStatus()
  },

  computed: {
    ...mapGetters('auth', ['user']),
    isMobileSize () {
      return this.window_size <= 425
    }
  },

  methods: {
    getWhitelabelStatus () {
      this.loading_whitelabel = true
      talk2Api.V1.statics.get().then(res => {
        this.whitelabel = res.data.whitelabel
        this.loading_whitelabel = false
      }).catch(err => {
        console.log(err)
        this.loading_whitelabel = false
        this.$root.handleErrors(err.response)
      })
    },
    windowResize () {
      this.window_size = window.screen.width
    },
    noClose (event) {
      if (event) {
        event.stopPropagation()
      }
    },
    getBuildInfo () {
      talk2Api.V1.buildInfo.get().then(res => {
        console.log('getBuildInfo', { res })
        this.env = res.data.env
        this.branch = res.data.branch
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style>

</style>
