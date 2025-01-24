<template>
  <div class="d-flex flex-column"
       data-testid="duration-row">
    <div class="ellipse"
         v-if="row.contact">
      <router-link class="text-primary"
                   target='_blank'
                   :to="{ path: `/contacts/${row.contact.id}`}">
        <external-link-icon color="#1976D2"/>
        {{ row.contact.name | fixContactName }}

        <q-tooltip>
          Click to go to contact's page
        </q-tooltip>
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
