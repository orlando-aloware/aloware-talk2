<template>
  <div v-if="profile && profile.company.talk_enabled && canSwitchApps"
       class="bridge-menu-wrapper">
    <q-btn v-if="isAdmin || isSupervisor"
           outline
           class="q-btn-standard"
           :href="classicUrl"
           @click="onGoToClassic">

        <span>{{ alowareClassic }}</span>
    </q-btn>
    <q-btn-dropdown
      v-else
      split
      class="q-shared-login-menu-dropdown "
      color="primary"
      padding="0px 10px"
      @click="onGoToClassic"
    >

      <template slot="label">
        <span>{{ alowareClassic }}</span>
        <hr role="separator" aria-orientation="vertical" class="q-separator ml-2 margin-auto position-relative q-separator q-separator--vertical">
      </template>

      <q-list class="q-shared-login-menu-dropdown-list pl-4 pr-4">
        <q-item>
          <q-item-section>
            <q-item-label class="text-grey-90">Open on Login:</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <b-form-radio inline
                          :value="AppDefaultLogin.APP_ALOWARE_TALK"
                          v-model="user.default_app"
                          @change="onInput">
              {{ alowareTalk }}
            </b-form-radio>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <b-form-radio inline
                          :value="AppDefaultLogin.APP_ALOWARE_CLASSIC"
                          v-model="user.default_app"
                          @change="onInput">
              {{ alowareClassic }}
            </b-form-radio>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import { cloneDeep } from 'lodash'
import { aclMixin, simpsocialMixin } from 'src/plugins/mixins'
import * as storage from 'src/plugins/helpers/storage'

export default {
  name: 'shared-login-menu',

  mixins: [
    aclMixin,
    simpsocialMixin
  ],

  computed: {
    ...mapGetters('auth', ['profile']),

    ...mapState(['statics']),

    canSwitchApps () {
      if (this.isAdmin || this.isSupervisor) {
        return true
      }

      return !this.profile.company.force_talk
    },

    alowareClassic () {
      if (this.profile.company.force_talk) {
        return `Admin`
      }

      return `Classic`
    },

    alowareTalk () {
      return this.isSimpSocial ? 'Talk' : `${this.statics.name} Talk`
    },

    classicUrl () {
      if (this.isSimpSocial) {
        const simpsocialUrl = process.env.API_URL?.replace('aloware', 'simpsocial')
        return simpsocialUrl + '?from_talk_2=1&token=' + storage.local.getItem('shared_cookie')
      }

      return process.env.API_URL + '?from_talk_2=1&token=' + storage.local.getItem('shared_cookie')
    }
  },

  data () {
    return {
      user: null,
      AppDefaultLogin
    }
  },

  methods: {
    ...mapActions('auth', ['setProfile']),
    onGoToClassic () {
      window.location.href = this.classicUrl
    },

    updateDefaultLogin () {
      talk2Api.V1.users.setDefaultLogin(this.profile.id, { default_app: this.user.default_app }).then(response => {
        const message = this.user.default_app === AppDefaultLogin.APP_ALOWARE_CLASSIC ? 'Classic' : 'Talk'
        const user = cloneDeep(this.user)
        this.setProfile(user)

        this.$generalNotification(`Default application login has been set to ${this.whiteLabelText}${message}.`)
      }).catch((err) => {
        this.$handleErrors(err.response)
      })
    },

    onInput () {
      this.updateDefaultLogin()
    }
  },

  created () {
    this.user = cloneDeep(this.profile)
  }
}
</script>
