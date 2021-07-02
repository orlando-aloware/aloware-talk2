<template>
  <div v-if="integration_data && !isEmpty(integration_data)"
       class="hubspot-integration-wrapper">
    <h5 class="integration-title">
      <b-link :href="integration_data['profile-url']">
        <i class="fab fa-hubspot"></i> Hubspot
      </b-link>

    </h5>
    <p v-if="integration_data.properties.firstname && integration_data.properties.lastname"
       class="name-wrapper">
      {{ integration_data.properties.firstname.value + ' ' + integration_data.properties.lastname.value }}
    </p>

    <p v-if="integration_data.properties.email">
      <span class="data-icon-label">
        <i class="far fa-envelope"></i> Email:
      </span>
      <span class="data-value">
        {{ integration_data.properties.email.value }}
      </span>
    </p>
    <p v-if="integration_data.properties.company">
       <span class="data-icon-label">
        <i class="far fa-building"></i> Company:
      </span>
      <span class="data-value">
        {{ integration_data.properties.company.value }}
      </span>
    </p>
    <p v-if="integration_data.properties.hubspot_owner">
       <span class="data-icon-label">
        <i class="far fa-user"></i> Owner:
      </span>
      <span class="data-value">
        {{ integration_data.properties.hubspot_owner.firstName + ' ' + integration_data.properties.hubspot_owner.lastName }}
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'integration-hubspot',
  props: {
    dialer_mode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      integration_name: 'hubspot',
      integration_data: {}
    }
  },
  methods: {
    getData () {
      return talk2Api.V1.contact.getIntegrationData(this.contact.id, {
        params: {
          integration_name: this.integration_name,
          dialer_mode: this.dialer_mode ? 1 : 0
        }
      }).then(response => {
        this.integration_data = response.data
      })
    }
  },
  mounted () {
    this.getData()
  },
  watch: {
    'contact': function () {
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.hubspot-integration-wrapper {
  .integration-title {
    font-size: 14px;
    font-weight: 500;

    i {
      color: #FF7A59;
    }
  }

  .name-wrapper {
    font-size: 14px;
    font-weight: 500;
  }

  p {

    font-size: 14px;

    .data-icon-label {

    }

    .data-value{
      font-weight: 500;
    }
  }
}
</style>
