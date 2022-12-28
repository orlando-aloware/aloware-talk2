<template>
  <div class="hubspot-integration-wrapper">
    <q-card class="hubspot-card"
            flat>
      <q-item class="p-0">
        <q-item-section v-if="contactLink">
          <b-link target="_blank"
                  :href="contactLink">
            <table>
              <tr>
                <td><img class="guesty-btn" /></td>
                <td><span class="integration-title">Guesty</span></td>
              </tr>
            </table>
          </b-link>
        </q-item-section>
        <q-item-section v-else>
          <a href="#"
             onclick="return false;">
              <table>
                <tr>
                  <td><img class="guesty-btn" /></td>
                  <td><span class="integration-title">Guesty</span></td>
                </tr>
              </table>
          </a>
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import { guestyIntegrationMixin, integrationMixin } from 'src/plugins/mixins'

export default {
  name: 'integration-guesty',

  components: {},

  mixins: [
    guestyIntegrationMixin,
    integrationMixin
  ],

  props: {
    contact: {
      type: Object,
      required: true
    },

    dialer_mode: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    contactLink () {
      if (!this.contactIntegrationDataLoaded) {
        return
      }

      return this.guestyContactLink(this.contact)
    }
  },

  data () {
    return {
      integrationData: null,
      contactIntegrationDataLoaded: false
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      await this.getData()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactClone']),

    getData () {
      return this.getIntegrationData(this.contact, 'guesty')
        .then(response => {
          this.integrationData = response.data
          this.contact.integration_data = response.data

          // update contact related states
          this.setContact(this.contact)
          this.setContactClone(this.contact)

          this.contactIntegrationDataLoaded = true
        })
    }
  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.contact && this.contact.id && this.$route.params.id === this.contact.id.toString()) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
