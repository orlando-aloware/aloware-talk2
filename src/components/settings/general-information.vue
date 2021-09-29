<template>
  <b-container>
    <b-form>
      <b-form-row class="mt-3">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Ring Groups</h5>
            <p class="form-helper-text">
              This user is a member of the following ring groups
            </p>

            <p class="form-helper-text text-bold text-red-8">
              This user is not connected to any ring group.
            </p>
          </div>
        </b-col>
      </b-form-row>
      <hr/>
      <b-form-row class="mt-4 no-gutters">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">SIP URI</h5>
            <p class="form-helper-text">
              A SIP-URI is the SIP addressing scheme that communicates who to call via SIP. In other words, a SIP URI is a user’s SIP phone number. The SIP URI resembles an e-mail address.
            </p>
          </div>

          <b-form-group
            label=""
            class="form-label"
          >
            <b-input-group>
              <b-form-input
                v-model="profile.sip_uri"
                type="text"
                placeholder="SIP URI"
                readonly
                required>

              </b-form-input>
              <b-input-group-append>
                <b-button size="sm"><i class="material-icons">content_copy</i></b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">SIP Domain</h5>
            <p class="form-helper-text">This is the domain the SIP phones connect to.</p>
          </div>

          <b-form-group
            label=""
            class="form-label"
          >
            <b-input-group>
              <b-form-input
                v-model="profile.sip_uri"
                type="text"
                placeholder="SIP Domain"
                readonly
                required>

              </b-form-input>
              <b-input-group-append>
                <b-button size="sm"><i class="material-icons">content_copy</i></b-button>
              </b-input-group-append>
            </b-input-group>

          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">SIP Username</h5>
            <p class="form-helper-text">The username / authorization name for this SIP device.</p>
          </div>

          <b-form-group
            label=""
            class="form-label"
          >
            <b-input-group>
              <b-form-input
                v-model="profile.sip_details.username"
                type="text"
                placeholder="SIP Username"
                readonly
                required>

              </b-form-input>
              <b-input-group-append>
                <b-button size="sm"><i class="material-icons">content_copy</i></b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">SIP Password</h5>
            <p class="form-helper-text">Password for this SIP device.</p>
          </div>

          <b-form-group
            label=""
            class="form-label"
          >
            <b-input-group>
              <b-form-input
                v-model="profile.sip_details.password"
                type="text"
                placeholder="SIP Password"
                readonly
                required>
              </b-form-input>
              <b-input-group-append>
                <b-button size="sm"><i class="material-icons">content_copy</i></b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">SIP Alias</h5>
            <p class="form-helper-text">An internal label for this device. Might be displayed on the physical phone.</p>
          </div>

          <b-form-group
            label=""
            class="form-label"
          >
            <b-input-group>
              <b-form-input
                v-model="profile.sip_details.alias"
                type="text"
                placeholder="SIP Alias"
                readonly
                required>
              </b-form-input>
              <b-input-group-append>
                <b-button size="sm"><i class="material-icons">content_copy</i></b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'general-information',

  computed: {
    ...mapGetters('auth', ['profile'])
  },

  data () {
    return {

    }
  }
}
</script>
