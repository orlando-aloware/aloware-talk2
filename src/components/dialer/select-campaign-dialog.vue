<template>
  <q-dialog content-class="select-campaign-dialog"
            position="bottom"
            persistent
            v-model="visible">
    <q-card class="card">
      <div class="d-flex mb-1"
           v-if='isSalesforceWidget && salesforceDialNumber?.number'>
        <strong>Calling to {{ salesforceDialNumber.number }}</strong>
      </div>

      <div class='d-flex mb-3 small-text'
           v-if='isSalesforceWidget && salesforceDialNumber?.recordName'>
        {{ salesforceDialNumber.recordName }}
      </div>
      <div class="label">Select a Line</div>
      <div class="d-flex">
        <line-selector class="line-selector"
                       label="Select a Line"
                       custom-placeholder="Pick a line"
                       rounded
                       behavior="menu"
                       :generic-multiselect="false"
                       v-model="localCampaignId"
                       @change="changeCampaignId">
        </line-selector>

        <div>
          <q-btn color="primary"
                 rounded
                 :disabled="!localCampaignId"
                 @click="onCallClick">
            Call
          </q-btn>
        </div>
      </div>
      <div class="d-flex"
           v-if='isSalesforceWidget'>
        <q-btn class="full-width mb-5"
               rounded
               @click="onCancelClick">
          Cancel
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import LineSelector from 'components/generic-selectors/line-selector'

export default {
  name: 'SelectCampaignDialog',

  components: {
    LineSelector
  },

  props: {
    campaignId: {
      type: Number,
      default: null,
      required: false
    }
  },

  data () {
    return {
      visible: true,
      position: 'top',
      localCampaignId: this.campaignId
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState(['isSalesforceWidget', 'salesforceDialNumber'])
  },

  watch: {
    campaignId (newVal) {
      this.localCampaignId = newVal
    }
  },

  methods: {
    changeCampaignId (campaignId) {
      this.localCampaignId = campaignId
    },

    onCallClick () {
      this.$emit('change-campaign-id', this.localCampaignId)
    },

    onCancelClick () {
      this.$emit('cancel-campaign-id')
    }
  }
}
</script>
