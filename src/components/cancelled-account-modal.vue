<template>
  <b-modal title="Cancelled Account"
           size="lg"
           modal-class="trial-expired-modal"
           scrollable
           centered
           hide-footer
           hide-header
           no-close-on-esc
           no-close-on-backdrop
           v-model="showModal">
    <b-overlay spinner-variant="primary"
               spinner-type="grow"
               spinner-small
               rounded="sm"
               :show="false">
      <div class="d-flex flex-column trial-expired-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 trial-expired-modal__title text-center">Your subscription has been cancelled.</div>
        </div>
        <div class="d-flex flex-center">
          <i class="fas fa-user-clock trial-expired-icon" style=""></i>
        </div>
        <div class="pt-3">
          <div class="mb-3"
               v-if="true">
            <div class="row">
              <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                <p>{{ profile.first_name }}, even though you have canceled your subscription, that doesn't mean this has to be the end of our journey together. If you'd like to renew your subscription and continue enjoying Aloware, we've made the process easy for you.</p>
              </div>
            </div>
            <div class="row">
              <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                <p>If there's anything we can assist with or if you have feedback that could help us improve, we're all ears. You can reach out to your CSM, {{ currentCompany.csm_rep  ? currentCompany.csm_rep.name + ',' : '' }} directly through {{ currentCompany.csm_rep?.email ?? 'sales@aloware.com' }}.</p>
              </div>
            </div>
            <div class="row">
              <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                <p>We value you as a customer and would love to serve you again!</p>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center flex-center pt-3">
          <button class="btn btn-primary mr-1"
                  @click="emailCsmRep">
            Restore Account
          </button>
          <button class="btn btn-primary ml-1"
                  @click="logoutAction">
            {{ logoutLabel }}
          </button>
        </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
import VueCookies from 'vue-cookies'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'cancelled-account-modal',

  mixins: [
    aclMixin
  ],

  props: {
    title: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      showModal: true
    }
  },

  computed: {
    ...mapState('auth', ['profile']),

    ...mapState('cache', ['currentCompany']),

    parsedCookieName () {
      return `${this.cookieName}-${this.profile?.id}`
    },

    mailToCsmRep () {
      return 'mailto:' + (this.currentCompany.csm_rep?.email || 'sales@aloware.com')
    }
  },

  created () {
    this.$cookies = VueCookies
  },

  methods: {
    openModal () {
      this.showModal = true
    },

    emailCsmRep () {
      window.open(this.mailToCsmRep, '_blank')
    }
  }
}
</script>
