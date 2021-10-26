<template>
  <div class="row w-100 h-100 d-flex">
    <div class="col-4 p-1" style="height:63vh;">
      <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-18 text-weight-medium">Scripts</div>
        </q-card-section>
      </q-card>

      <DetailsLeads
        :resources="scripts" />

    </div>
    <div class="col-4 p-1" style="height:63vh;">
      <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-18 text-weight-medium">
            <HubSpotIcon />
            Open in HubSpot
          </div>
        </q-card-section>
      </q-card>

      <DetailsForm
        :resources="form" />

    </div>
    <div class="col-4 p-1" style="height:63vh;">

      <DetailsTools />

    </div>
  </div>
</template>

<script>

import DetailsLeads from './details-scripts'
import DetailsForm from './details-form'
import DetailsTools from './details-tools'
import HubSpotIcon from 'components/icons/hubspot-icon'

export default {
  name: 'SessionPageDetails',
  components: {
    DetailsLeads,
    DetailsForm,
    DetailsTools,
    HubSpotIcon
  },
  data () {
    return {
      scripts: {
        leads: '',
        options: [
          { value: 1, label: 'Cold Leads' },
          { value: 2, label: 'Hot Leads' },
          { value: 3, label: 'Sample Leads' }
        ],
        message: 'Hi, my name’s Natasha. I saw that you recently purchased a home. Are you by chance looking for car insurance?<br/><br/>Great. Let me tell you about some products we offer.<br/><br/>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br/><br/>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Hi, my name’s Natasha. I saw that you recently purchased a home. Are you by chance looking for car insurance?<br/><br/>Great. Let me tell you about some products we offer.'
      },
      form: {
        first_name: 'Jimmy',
        last_name: 'Peterson',
        email: 'kimmy@ailearning.io',
        company: 'AI Learning',
        website: 'www.ai.io',
        city: 'San Francisco',
        state: 'California, CA',
        country: 'United States',
        zip_code: '987756',
        tcpa_approved: 'Yes',
        created_at: 'A day ago'
      }
    }
  }
}
</script>
