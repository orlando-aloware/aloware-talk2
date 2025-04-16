<template>
  <div class="ellipse"
       data-testid="ring-group-row">
    <a class="cursor-pointer"
       target="_blank"
       :href="getRingGroupURL(row.ring_group_id)"
       @click="handleRingGroupClick(row.ring_group_id, $event)"
       v-if="row.ring_group_id && ringGroupName !== 'Deleted Ring Group'">
      <external-link-icon color="#1976D2"/>
      {{ ringGroupName }}

      <q-tooltip>
        Click to go to ring group's page
      </q-tooltip>
    </a>
    <span
      v-else-if="isAgent || row.ring_group_id"
      :class="{ 'deleted': ringGroupName === 'Deleted Ring Group' }">
      {{ ringGroupName }}
    </span>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import communicationsMixin from 'src/plugins/mixins/communications.mixin'
import { mapState } from 'vuex'

export default {
  name: 'RingGroup',

  components: {
    ExternalLinkIcon
  },

  mixins: [
    aclMixin,
    classicMixin,
    communicationsMixin
  ],

  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    ...mapState([
      'ringGroups',
      'ringGroupsIsLoading'
    ]),

    ringGroup () {
      return this.ringGroups.find(rg => rg.id === this.row.ring_group_id) || {}
    },

    ringGroupName () {
      return this.row.ring_group_id && !this.ringGroup.name && !this.ringGroupsIsLoading ? 'Deleted Ring Group' : (this.ringGroup.name || '')
    }
  },

  methods: {
    handleRingGroupClick (ringGroupId, e) {
      const url = this.getRingGroupURL(ringGroupId)
      // Only handle navigation in Electron, let browser handle it normally
      this.handleElectronNavigation(e, url)
    }
  }
}
</script>
