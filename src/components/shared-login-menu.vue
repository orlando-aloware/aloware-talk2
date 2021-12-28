<template>
  <div class="bridge-menu-wrapper">
    <q-btn v-if="!isAdmin"
           outline
           class="q-btn-standard"
           @click="onGoToClassic">

        <i class="fas fa-arrow-right"></i>  <span>Aloware Classic</span>
    </q-btn>
    <q-btn-dropdown
      v-else
      split
      class="q-shared-login-menu-dropdown "
      color="primary"
      padding="0px 10px"
      :menu-offset="[0, 1]"
      @click="onGoToClassic"
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
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import _ from 'lodash'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'shared-login-menu',

  mixins: [aclMixin],

  computed: {
    ...mapGetters('auth', ['profile'])
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
      window.location.href = process.env.API_URL + '?from_talk_2=1&token=' + localStorage.getItem('shared_cookie')
    },
    updateDefaultLogin () {
      talk2Api.V1.users.setDefaultLogin(this.profile.id, { default_app: this.user.default_app }).then(response => {
        this.user = response.data
        this.setProfile(response.data)
      })
    },
    onInput () {
      this.updateDefaultLogin()
    }
  },

  created () {
    this.user = _.cloneDeep(this.profile)
  }
}
</script>
