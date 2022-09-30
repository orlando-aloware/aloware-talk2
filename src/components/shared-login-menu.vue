<template>
  <div v-if="profile && profile.company.talk_enabled && canSwitchApps"
       class="bridge-menu-wrapper">
    <q-btn v-if="isAdmin"
           outline
           class="q-btn-standard"
           @click="toggleFeedbackDialog">

        <i class="fas fa-arrow-right"></i>  <span>Aloware Classic</span>
    </q-btn>
    <q-btn-dropdown
      v-else
      split
      class="q-shared-login-menu-dropdown "
      color="primary"
      padding="0px 10px"
      @click="toggleFeedbackDialog"
    >

      <template slot="label">
        <i class="fas fa-arrow-right"></i>  <span>Aloware Classic</span>
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
              Aloware Talk
            </b-form-radio>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <b-form-radio inline
                          :value="AppDefaultLogin.APP_ALOWARE_CLASSIC"
                          v-model="user.default_app"
                          @change="onInput">
              Aloware Classic
            </b-form-radio>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <talk-feedback-form :shouldOpen="isFeedbackModalOpen"
                        @toggle="toggleFeedbackDialog"
                        @submit="onGoToClassic"/>
  </div>
</template>

<script>
import TalkFeedbackForm from './forms/talk-feedback-form.vue'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import _ from 'lodash'
import { aclMixin } from 'src/plugins/mixins'
import * as storage from 'src/plugins/helpers/storage'

export default {
  name: 'shared-login-menu',

  mixins: [aclMixin],

  components: { TalkFeedbackForm },

  computed: {
    ...mapGetters('auth', ['profile']),
    canSwitchApps () {
      if (this.isAdmin) {
        return true
      }

      return !this.profile.company.force_talk
    }
  },

  data () {
    return {
      user: null,
      AppDefaultLogin,
      isFeedbackModalOpen: false
    }
  },

  methods: {
    ...mapActions('auth', ['setProfile']),
    onGoToClassic () {
      window.location.href = process.env.API_URL + '?from_talk_2=1&token=' + storage.local.getItem('shared_cookie')
    },
    updateDefaultLogin () {
      talk2Api.V1.users.setDefaultLogin(this.profile.id, { default_app: this.user.default_app }).then(response => {
        const message = this.user.default_app === AppDefaultLogin.APP_ALOWARE_CLASSIC ? 'Classic' : 'Talk'
        const user = _.cloneDeep(this.user)
        this.setProfile(user)

        this.$generalNotification('Default application login has been set to Aloware ' + message + '.')
      }).catch((err) => {
        this.$handleErrors(err.response)
      })
    },
    onInput () {
      this.updateDefaultLogin()
    },
    toggleFeedbackDialog () {
      this.isFeedbackModalOpen = !this.isFeedbackModalOpen
    }
  },

  created () {
    this.user = _.cloneDeep(this.profile)
  }
}
</script>
