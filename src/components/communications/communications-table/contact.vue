<template>
  <div class="d-flex flex-column"
       data-testid="duration-row">
    <div v-if="row.contact">
      <router-link class="text-primary"
                   target='_blank'
                   :to="{ path: `/contacts/${row.contact.id}`}">
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
export default {
  name: 'Contact',

  props: {
    row: {
      type: Object,
      required: false
    }
  }
}
</script>
