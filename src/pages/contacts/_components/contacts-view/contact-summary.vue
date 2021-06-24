<template>
  <b-card class="mt-2 mb-2 border-0 position-relative">
    <h6>About this contact</h6>

    <div class="pb-4 summary-container">
      <div class="d-inline-flex">
        <div class="label ellipsis">
          <i class="material-icons">person_outline</i> Owner:
        </div>
        <div class="value ellipsis" v-b-tooltip="`Hubspot Integration`">
          Hubspot Integration
        </div>
      </div>

      <div class="d-inline-flex">
        <div class="label ellipsis">
          <i class="material-icons">mail_outline</i> Email:
        </div>
        <div class="value ellipsis" v-b-tooltip="contact.email">
          {{ contact.email }}
        </div>
      </div>

      <div class="d-inline-flex">
        <div class="label ellipsis" v-b-tooltip="`City &amp;amp; State`">
          <i class="material-icons">fmd_good</i> City &amp;amp; State:
        </div>
        <div class="value ellipsis" v-b-tooltip="`San Francisco, CA`">
          San Francisco, CA
        </div>
      </div>

      <div class="d-inline-flex">
        <div class="label ellipsis">
          <i class="material-icons">language</i> Website:
        </div>
        <div class="value">
          www.website.com
        </div>
      </div>
      <div class="d-inline-flex">
        <div class="label ellipsis" v-b-tooltip="`Intake Source`">
          <i class="material-icons">system_update_alt</i> Intake Source:
        </div>
        <div class="value ellipsis" v-b-tooltip="contact.intake_source">
          {{ contact.intake_source }}
        </div>
      </div>
    </div>

    <b-button pill
              variant="light"
              size="sm"
              class="contact-summary-toggle" @click="onExpanded">
      <i class="material-icons">{{ is_expanded ? 'expand_less' : 'expand_more' }}</i>
    </b-button>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-summary',
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      is_expanded: false
    }
  },
  methods: {
    onExpanded () {
      this.is_expanded = !this.is_expanded
    }
  }
}
</script>

<style lang="scss" scoped>
  .summary-container{
    font-size: 90%;
  }

  .contact-summary-toggle {
    background: transparent;
    border: 1px solid #dee2e6;
    position: absolute;
    margin: 0;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  div.label {
    font-size: 1em;
    display: inline-block;
    width: 90px;
    color: #6c757d !important;
    padding-right: 8px;
  }

  div.value {
    font-size: 1em;
    display: inline-block;
    width: 180px;
    color: #6c757d !important;
    padding-right: 8px;
  }

</style>
