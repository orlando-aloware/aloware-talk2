<template>
  <b-modal title="Trial Expired"
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
                  <div class="flex-grow-1 trial-expired-modal__title text-center">Your trial account has expired</div>
              </div>
              <div class="d-flex flex-center">
                <i class="fas fa-user-clock trial-expired-icon" style=""></i>
              </div>
              <div class="pt-3">
                  <div class="mb-3"
                       v-if="true">
                      <div class="row">
                          <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                            <p>{{ profile.first_name }}, your trial period has ended, and what an incredible journey it's been! We trust you've discovered the wealth of features and benefits aimed at streamlining your connection with prospects and customers, making every interaction more impactful.</p>
                          </div>
                      </div>
                      <div class="row">
                          <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                            <p>Though your trial has concluded, your path to success doesn't need to end.</p>
                          </div>
                      </div>
                      <div class="row">
                          <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                            <p>Dive into our variety of plans and flexible billing options, and upgrade today. Ensure you never miss a lead and your customers have uninterrupted access to you!</p>
                          </div>
                      </div>
                      <div class="row">
                          <div class="col-12 d-flex align-items-center flex-center text-center pl-0">
                            <p>Should you have any inquiries or require additional support, remember, our team is just a message away.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div class="d-flex align-items-center flex-center pt-3">
                  <button v-if="this.current_company.sales_rep"
                          class="btn btn-primary mt-0"
                          @click="emailSalesRep">
                      Upgrade Now
                  </button>
                  <button v-if="!this.current_company.sales_rep"
                          class="btn btn-primary mt-0"
                          @click="openDemo">
                      Upgrade Now
                  </button>
              </div>

              <div v-if="this.currentCompany.sales_rep">
                  <div class="d-flex align-items-center flex-center pt-3">
                      <p class="mb-0">Sales Contact:
                          <strong class="mb-0 text-dark">
                              {{ this.currentCompany.sales_rep.name }}
                          </strong>
                      </p>
                  </div>
                  <div class="d-flex align-items-center flex-center pt-0">
                      <p class="mb-0">Email address:
                          <strong class="mb-0 text-dark">
                              <a :href="'mailto:' + this.currentCompany.sales_rep.email"
                                 target="_blank">
                                  {{ this.currentCompany.sales_rep.email }}
                              </a>
                          </strong>
                      </p>
                  </div>
              </div>

              <div class="d-flex align-items-center flex flex-column pt-3">
                <p class="mt-3 mb-0">Contact Support:</p>
                <p class="my-2">
                  <a href="tel:(855) 256-2001">
                      <i class="fa fa-phone-alt"></i>
                      (855) 256-2001
                  </a>
                  <span class="mx-2 text-dark">|</span>
                  <a href="https://aloware.com"
                      target="_blank">
                      <i class="fa fa-globe"></i>
                      Visit Website
                  </a>
                </p>
              </div>
          </div>
      </b-overlay>
  </b-modal>
</template>

<script>
import VueCookies from 'vue-cookies'
import { mapState } from 'vuex'

export default {
  name: 'trial-expired-modal',

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
    }
  },

  created () {
    this.$cookies = VueCookies
  },

  methods: {
    openModal () {
      this.showModal = true
    },

    openDemo () {
      window.open('https://meetings.hubspot.com/alwr/aloware-demo', '_blank')
    },

    emailSalesRep () {
      window.open('mailto:' + this.current_company.sales_rep.email, '_blank')
    }
  }
}
</script>
