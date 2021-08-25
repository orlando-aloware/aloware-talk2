<template>
  <b-card class="border-0 contact-lines-wrapper">
    <line-selector :value="lineValues"
                   :multiple="true"
                   @change="submitLines"/>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
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
    ...mapActions('contacts', ['setLines', 'setContactLines']),

    submitLines (lines) {
      talk2Api.V1.contact.storeLines(this.contact.id, {
        campaign_ids: lines
      }).catch(err => {
        console.log(err)
        this.$root.handleErrors(err.response)
      })
    }
  }
}
</script>
