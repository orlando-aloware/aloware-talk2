<template>
  <b-card class="border-0 contact-ring-groups-wrapper" data-testid="contact-ring-groups-wrapper">
    <ring-group-selector :value="ringGroupValues"
                         :multiple="true"
                         data-testid="contact-ring-groups-selector"
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
      talk2Api.V1.contact.storeRingGroups(this.contact.id, { ring_group_ids: ringGroupIds })
        .then(() => {
          this.$generalNotification("Contact's ring group is updated.")
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
    }
  }
}
</script>
