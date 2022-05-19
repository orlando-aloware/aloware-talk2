<template>
  <q-item>
    <q-item-section class="nav-item dropdown pos-stc-xs mr-2"
                    v-if="!whitelabel && !loading_whitelabel && !isMobileSize"
                    avatar>
      <q-btn-dropdown class="tab-dropdown"
                      ref="menu"
                      flat
                      :menu-offset="[4, 16]">
        <template v-slot:label>
          <a class="nav-link"
              data-toggle="dropdown"
              data-tour-step="2"
              ref="helpMenu">
            <q-icon name="info"
                    class="material-icons-outlined ml-2 cursor-pointer"
                    color="#62666E"
                    size="14px">
              <q-tooltip anchor="top middle"
                          self="center middle">
                These are the contact list your admin shares with you.
              </q-tooltip>
            </q-icon>
          </a>
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
              class="btn btn-block new-blue mt-2"
              href="https://support.aloware.com"
              target="_blank">
            Get Help
          </a>
          <a v-if="!user.profile.company.reseller_id"
            class="btn btn-block btn-success"
            href="https://aloware.com/setup-guide"
            target="_blank">
            Setup Guide
          </a>
          <q-separator v-if="env !== 'production'" class="mt-1 mb-1"></q-separator>
          <p class="mb-0 mt-2 text-xs"
            v-if="branch && env && env !== 'production'">
            Environment: <span class="_600">{{ env }}</span>
            <br>
            Branch: <span class="_600">{{ branch }}</span>
          </p>
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
