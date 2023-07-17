<template>
  <q-item class="header-help-wrapper">
    <q-item-section class="nav-item dropdown"
                    v-if="statics.name && !statics.whitelabel && !isMobileSize">
      <q-btn-dropdown class="tab-dropdown"
                      ref="menu"
                      flat
                      :ripple="false"
                      :menu-offset="[4, 16]">
        <template v-slot:label>
                  <i class="fa fa-question-circle text-2x text-danger header-help-icon-wrapper"/>
        </template>

        <q-list class="tab-dropdown-list p-3 allow-select header-help-dropdown-list">
          <span class="text-md"
                v-if="user.profile"
                @click="noClose($event)">
                Service code: <b>{{ user.profile.company_id }}-{{ user.profile.id }}</b>
          </span>
          <br>
          <span class="text-md"
                v-if="user.profile"
                @click="noClose($event)">
            Role: <b>{{ user.profile.role_name }}</b>
          </span>

          <q-btn class="mt-2 d-block"
                 href="https://support.aloware.com"
                 target="_blank"
                 type="a"
                 color="primary"
                 unelevated
                 no-caps
                 v-if="!user.profile.company.reseller_id">
            Get Help
          </q-btn>
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </q-item>
</template>

<script>
import * as Roles from 'src/constants/roles'
import { mapGetters, mapState } from 'vuex'

export default {
  data () {
    return {
      env: null,
      branch: null,
      windowSize: null,
      Roles
    }
  },

  created () {
    // initialize window width size
    this.windowSize = window.screen.width

    // Add listener to window resize
    window.addEventListener('resize', this.windowResize)
  },

  computed: {
    ...mapGetters('auth', ['user']),
    ...mapState(['statics']),

    isMobileSize () {
      return this.windowSize <= 425
    }
  },

  methods: {
    windowResize () {
      this.windowSize = window.screen.width
    },

    noClose (event) {
      if (event) {
        event.stopPropagation()
      }
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.windowResize)
  }
}
</script>
