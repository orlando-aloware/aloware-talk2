<template>
  <div>
    <vue-multiselect track-by="id"
                     label="name"
                     class="mr-1"
                     style="width: 100%"
                     placeholder="Select line"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="true"
                     :options="formattedLineOptions"
                     :show-labels="false"
                     :allow-empty="false"
                     v-model="line"
                     @select="onSelect"/>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import { mapGetters, mapState } from 'vuex'
import contactMixin from 'src/plugins/mixins/contact.mixin'

export default {
  name: 'contact-line-selector',
  mixins: [contactMixin],
  components: { VueMultiselect },
  computed: {
    ...mapGetters({}),
    ...mapState({ currentCompany: 'currentCompany' }),
    formattedLineOptions () {
      let contactLines = []
      if (this.contactCampaignsFromCommunications.length > 0) {
        contactLines = [...this.contactCampaignsFromCommunications]

        contactLines.unshift({
          group: 'Contact Lines',
          disable: true
        })
      }

      let linesArray = contactLines

      if (this.otherCampaignsFromCommunications && this.otherCampaignsFromCommunications.length > 0) {
        let otherLines = [...this.otherCampaignsFromCommunications]
        otherLines.unshift({
          group: 'Other Lines',
          disable: true
        })
        linesArray = [...contactLines, ...otherLines]
      }

      return linesArray
    }
  },
  data () {
    return {
      line: null
    }
  },
  methods: {
    onSelect (selected) {
      this.$emit('select', selected)
    }
  }
}
</script>

<style scoped>

</style>
