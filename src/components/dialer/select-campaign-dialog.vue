<template>
  <q-dialog content-class="select-campaign-dialog"
            position="bottom"
            persistent
            v-model="visible">
    <q-card class="card">
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
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters('auth', ['profile'])
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
    }
  }
}
</script>
