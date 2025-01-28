<template>
  <div class="d-flex flex-column"
       data-testid="duration-row">
    <div class="ellipse"
         v-if="row.contact">
      <router-link class="text-primary"
                   target='_blank'
                   :id="`comm-contact-${_uid}`"
                   :to="{ path: `/contacts/${row.contact.id}`}">
        <external-link-icon color="#1976D2"/>
        {{ row.contact.name | fixContactName }}

        <b-tooltip custom-class="communication-logs-table__tooltip"
                   :target="`comm-contact-${_uid}`">
          Click to go to contact's page
        </b-tooltip>
      </router-link>
    </div>

    <div>
      {{ row.lead_number | fixPhone('NATIONAL', true) }}
    </div>
  </div>
</template>

<script>
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'

export default {
  name: 'Contact',

  components: {
    ExternalLinkIcon
  },

  props: {
    row: {
      type: Object,
      required: false
    }
  }
}
</script>
