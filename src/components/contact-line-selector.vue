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

export default {
  name: 'contact-line-selector',
  components: { VueMultiselect },
  computed: {
    formattedLineOptions () {
      const contactLines = { data: [] }
      if (this.contactCampaignsFromCommunications.length > 0) {
        contactLines.data = [...this.contactCampaignsFromCommunications]
        contactLines.data.unshift({
          group: 'Contact Lines',
          disable: true
        })
      }

      const linesArray = { data: contactLines.data }

      if (this.otherCampaignsFromCommunications && this.otherCampaignsFromCommunications.length > 0) {
        const otherLines = [...this.otherCampaignsFromCommunications]
        otherLines.unshift({
          group: 'Other Lines',
          disable: true
        })
        linesArray.data = [...contactLines.data, ...otherLines]
      }

      return linesArray.data
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
