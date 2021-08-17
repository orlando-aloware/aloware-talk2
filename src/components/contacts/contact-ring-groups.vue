<template>
  <b-card class="border-0 contact-ring-groups-wrapper">
    <ring-group-selector :value="ringGroupValues"
                         :multiple="true"
                         @change="submit"/>
  </b-card>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import RingGroupSelector from 'components/generic-selectors/ring-group-selector'
import { mapGetters } from 'vuex'

export default {
  name: 'contact-ring-groups',

  components: {
    RingGroupSelector
  },

  computed: {
    ...mapGetters('contacts', ['contact']),
    ringGroupValues () {
      if (this.contact && typeof this.contact.ring_groups !== 'undefined') {
        return this.contact.ring_groups.map(ringGroup => ringGroup.id)
      }
      return []
    }
  },

  methods: {
    submit (ringGroupIds) {
      console.log(ringGroupIds)
      talk2Api.V1.contact.storeRingGroups(this.contact.id, { ring_group_ids: ringGroupIds })
        .catch(err => {
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    }
  }
}
</script>
