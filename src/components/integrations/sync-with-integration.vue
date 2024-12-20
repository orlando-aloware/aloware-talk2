<template>
  <q-card-section  data-testid="integration-hubspot-card-section-3">
    <b-row>
      <b-button class="text-white"
                size="sm"
                variant="primary"
                tabindex="0"
                block
                data-testid="integration-hubspot-sync-button"
                @click="syncHubspot">
        <i class="fa fa-sync-alt" v-if="!isSyncing"></i>
        <q-spinner-bars v-if="isSyncing"
                        data-testid="integration-hubspot-sync-spinner"
                        color="white">
        </q-spinner-bars>
        {{ isSyncing ? 'Syncing...' : 'Sync with HubSpot' }}
        <q-tooltip anchor="center start"
                   self="center left"
                   data-testid="integration-hubspot-sync-tooltip"
                   :offset="[-220, 10]">
          <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelName }} and HubSpot.</p>
          <p class="font-weight-bold">You'll want to click on this button if:</p>
          <p class="mt-1 mb-0">- The contact was recently merged in HubSpot with another contact.</p>
          <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelName }} and HubSpot data on this contact.</p>
        </q-tooltip>
      </b-button>
    </b-row>
  </q-card-section>
</template>
<script setup lang='ts'>
</script>
