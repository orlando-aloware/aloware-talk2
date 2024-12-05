<template>
  <div v-if="profile && canSwitchApps"
       class="bridge-menu-wrapper">
    <q-btn v-if="(isAdmin || isSupervisor) && showAloAiPromotionButton"
                 outline
                 class="q-btn-standard q-mr-md"
                 @click="showInfoBox = true">
      <sparkle-icon width="16" height="16" color="#9333EA"/>
      <span>AI Engine Ready</span>
    </q-btn>
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
    <q-dialog v-model="showInfoBox">
      <div style="position: absolute; top: 65px; right: 5px; width: 400px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); padding: 15px; font-family: Arial, sans-serif; background: linear-gradient(90deg, #9333ea, #6b46c1); color: white;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="font-size: 24px; margin-right: 10px;">🎁</span>
          <span style="font-size: 16px; font-weight: bold;">
            We've enabled 5000 minutes of AloAi voice analytics for your account.
          </span>
        </div>
        <p style="margin-bottom: 10px;">
          Our AI engine will transcribe, analyze, and summarize your calls. Navigate to any contact you've called to see it in effect.
          <strong>Love it? Contact us for an unbeatable offer to make it permanent.</strong>
        </p>
        <div>
          <a href="#"
            style="color: #ffe4e6; text-decoration: underline; display: block; margin-bottom: 5px;">
            Read more: agent guide to AloAi voice analytics
          </a>
          <a href="#"
            style="color: #ffe4e6; text-decoration: underline; display: block;">
            Read more: admins guide to AloAi voice analytics
          </a>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import { cloneDeep } from 'lodash'
import { aclMixin, classicMixin, simpsocialMixin } from 'src/plugins/mixins'
import * as storage from 'src/plugins/helpers/storage'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'

export default {
  name: 'shared-login-menu',

  mixins: [
    aclMixin,
    classicMixin,
    simpsocialMixin
  ],

  components: {
    SparkleIcon
  },

  computed: {
    ...mapGetters('auth', ['profile']),

    ...mapState(['statics']),

    canSwitchApps () {
      if (this.isAdmin || this.isSupervisor) {
        return true
      }

      return false
    },

    showAiEngineButton () {
      return this.screenWidth >= 1200
    },

    alowareClassic () {
      return `Admin`
    },

    alowareTalk () {
      return this.isSimpSocial ? 'Talk' : `${this.statics.name} Talk`
    },

    classicUrl () {
      return `${this.getClassicURL(this.isSimpSocial)}?from_talk_2=1&token=${storage.local.getItem('shared_cookie')}`
    }
  },

  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },

  data () {
    return {
      user: null,
      AppDefaultLogin,
      showInfoBox: false,
      screenWidth: window.innerWidth
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

    updateScreenWidth () {
      this.screenWidth = window.innerWidth
    },

    onInput () {
      this.updateDefaultLogin()
    }
  },

  created () {
    this.user = cloneDeep(this.profile)

    window.addEventListener('resize', this.updateScreenWidth)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.updateScreenWidth)
  }
}
</script>
