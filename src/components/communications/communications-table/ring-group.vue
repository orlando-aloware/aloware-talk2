<template>
  <div class="ellipse"
       data-testid="ring-group-row">
    <span v-if="isAgent && row.ring_group_id">
      {{ ringGroup.name }}
    </span>
    <a target='_blank'
       :href="getRingGroupURL(row.ring_group_id)"
       v-else-if="row.ring_group_id">
      <external-link-icon color="#1976D2"/>
      {{ ringGroup.name }}

      <q-tooltip>
        Click to go to ring group's page
      </q-tooltip>
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'RingGroup',

  components: {
    ExternalLinkIcon
  },

  mixins: [
    aclMixin,
    classicMixin
  ],

  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    ...mapState(['ringGroups']),

    ringGroup () {
      return this.ringGroups.find(rg => rg.id === this.row.ring_group_id) || {}
    }
  }
}
</script>
