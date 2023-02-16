<template>
  <div class="row w-100">
    <section class="w-100 mx-0 mt-5">
      <!-- brand -->
      <div class="d-flex justify-content-center w-100 mt-5 mb-5">
        <img :src="`${apiURL}${statics.logo}`"
             height="70px"
             v-if="statics.logo"
             alt="logo">
      </div>
      <!-- / brand -->
      <div class="w-100 mb-4">
        <div class="margin-auto p-2"
             style="max-width: 550px;">
          <h2>Hey! It looks like that your account has been suspended. Please
            contact our support at
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id != 357">
              support@aloware.com
            </span>
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id == 357">
              support@simpsocial.com
            </span>
            or call
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id != 357">
                855-256-2001
            </span>
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id == 357">
                888-829-1110
            </span>
            for assistance.
          </h2>
        </div>
      </div>
      <div class="w-100 text-center-align">
        <b-button href="mailto:support@aloware.com"
                  variant="success"
                  size="sm"
                  class="mr-2"
                  v-if="currentCompany && currentCompany.reseller_id !== 357">
          Send an Email
        </b-button>
        <b-button href="mailto:support@simpsocial.com"
                  variant="success"
                  size="sm"
                  class="mr-2"
                  v-if="currentCompany && currentCompany.reseller_id === 357">
          Send an Email
        </b-button>
        <b-button href="tel:+18552562001"
                  variant="primary"
                  size="sm"
                  v-if="currentCompany && currentCompany.reseller_id !== 357">
          Call us
        </b-button>
        <b-button href="tel:+18888291110"
                  variant="primary"
                  size="sm"
                  v-if="currentCompany && currentCompany.reseller_id === 357">
          Call us
        </b-button>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Suspended',
  data () {
    return {
      loadingWhitelabel: false,
      apiURL: process.env.API_URL
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', [
      'authenticated',
      'profile'
    ]),
    ...mapState(['statics'])
  }
}
</script>
