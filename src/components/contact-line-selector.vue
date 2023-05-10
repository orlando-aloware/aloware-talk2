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
                     :preselect-first="preselectFirst"
                     v-model="line"
                     @select="onSelect"/>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import LinesMixins from 'src/plugins/mixins/lines.mixin'

export default {
  name: 'contact-line-selector',

  mixins: [
    LinesMixins
  ],

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: Number,
      required: false
    },

    showPaused: {
      type: Boolean,
      default: true
    },

    useGroups: {
      type: Boolean,
      default: true
    },

    preselectFirst: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formattedLineOptions () {
      const contactLines = { data: [] }
      if (this.contactCampaignsFromCommunications.length > 0) {
        contactLines.data = [...this.contactCampaignsFromCommunications]

        if (this.useGroups) {
          contactLines.data.unshift({
            group: 'Contact Lines',
            disable: true
          })
        }
      }

      const linesArray = { data: contactLines.data }

      if (this.otherCampaignsFromCommunications && this.otherCampaignsFromCommunications.length > 0) {
        const otherLines = [...this.otherCampaignsFromCommunications]

        if (this.useGroups) {
          otherLines.unshift({
            group: 'Other Lines',
            disable: true
          })
        }

        linesArray.data = [...contactLines.data, ...otherLines]
      }

      // filter lines if prop is false and only those who has active attribute
      if (!this.showPaused) {
        linesArray.data = linesArray.data.filter(line => 'active' in line ? line.active : true)
      }

      return linesArray.data
    }
  },

  data () {
    return {
      line: null
    }
  },

  mounted () {
    // if component value is set, search for that specific line to fill as the option
    // if (this.value) {
    //   this.line = this.formattedLineOptions.find(line => line.id === this.value)
    // }
  },

  methods: {
    onSelect (selected) {
      this.$emit('select', selected)
    }
  }
}
</script>
