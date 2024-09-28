<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            :full-width="dialogFullScreen"
            :full-height="dialogFullScreen"
            :maximized="dialogFullScreen"
            v-model="showAccountSelector">
    <q-card class="select-account--dialog bg-white text-black text-center q-pt-md"
            :class="{ 'fullscreen': dialogFullScreen }">
      <q-card-section class="row items-center q-pb-none q-pt-none">
        <div class="d-flex justify-end w-100">
          <q-btn icon="close"
                 flat
                 round
                 dense
                 size="12px"
                 v-if="!welcomeAccountSelectorFirstLoad"
                 @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="logo-section">
        <img class="logo-image"
             alt="Logo"
             :src="appLogo" />
      </q-card-section>

      <q-card-section class="mb-4">
        <div class="text-body2 text-center mb-4">
          <h6 class="q-mb-md"
             v-if="welcomeAccountSelectorFirstLoad">
            Welcome <strong>{{ profile.first_name }}</strong>! You have access to multiple accounts.
          </h6>
          <p class="q-mb-md"
             v-if="!welcomeAccountSelectorFirstLoad">
            You are currently logged into account <strong>{{ currentCompany.name }}</strong>.
          </p>
          <p class="q-mb-md"
             v-if="!welcomeAccountSelectorFirstLoad">
            Please choose the account you want to switch to:
          </p>
          <p class="q-mb-md"
             v-else>
            Please choose the account you want to proceed with.
          </p>
        </div>

        <q-spinner-bars color="primary"
                        size="30px"
                        v-if="isLoadingAccesses" />
        <div class="d-flex justify-center items-center w-100"
             v-else>
          <div class="column items-center">
            <compact-btn class="mb-3"
                         variant="primary"
                         :key="access.company_id"
                         v-for="access in accessesWithoutCurrent"
                         @clicked="companyLogin(access)">
              {{ access.company.name }}
            </compact-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { accessMixin, guestFormsMixin } from 'src/plugins/mixins'
import CompactBtn from 'src/components/compact-btn.vue'

export default {
  name: 'AccountSelectorDialog',

  mixins: [
    accessMixin,
    guestFormsMixin
  ],

  components: {
    CompactBtn
  },

  computed: {
    ...mapState(['isMobile']),

    accessesWithoutCurrent () {
      if (this.showAccountSelectorFirstLoad) {
        return this.accesses
      }

      return this.accesses.filter(access => access.company_id !== this.currentCompany.id)
    },

    welcomeAccountSelectorFirstLoad () {
      return this.showAccountSelectorFirstLoad && this.showAccountSelectorFullscreen
    },

    dialogFullScreen () {
      return this.showAccountSelectorFullscreen || this.isMobile
    }
  },

  methods: {
    ...mapActions('cache', ['setCurrentCompany']),
    ...mapActions('auth', ['logout']),

    closeDialog () {
      this.setShowAccountSelector(false)
      this.setShowAccountSelectorFullscreen(false)
    }
  },

  mounted () {
    if (this.accesses.length === 0) {
      this.getAccesses()
    }
  }
}
</script>
