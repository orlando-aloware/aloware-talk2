<template>
  <b-card class="border-0 contact-lines-wrapper" data-testid="contact-lines-card">
    <line-selector :value="lineValues"
                   :multiple="true"
                   data-testid="contact-lines-selector"
                   @change="submitLines"/>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import LineSelector from 'components/generic-selectors/line-selector'

export default {
  name: 'contact-lines',

  mixins: [aclMixin],

  components: {
    LineSelector
  },

  computed: {
    ...mapGetters('contacts', ['contact']),
    lineValues () {
      if (this.contact && typeof this.contact.campaigns !== 'undefined') {
        return this.contact.campaigns.map(campaign => campaign.id)
      }
      return []
    }
  },

  methods: {
    submitLines (lines) {
      talk2Api.V1.contact.storeLines(this.contact.id, {
        campaign_ids: lines
      }).then(() => {
        this.$generalNotification("Contact's line is updated.")
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    }
  }
}
</script>
