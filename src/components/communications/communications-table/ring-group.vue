<template>
  <div class="ellipse"
       data-testid="ring-group-row">
    <a class="cursor-pointer"
       target="_blank"
       :href="getRingGroupURL(ringGroupId)"
       :id="`comm-ring-group-${_uid}`"
       v-if="ringGroup.id && !isAgent"
       @click="handleRingGroupClick(ringGroupId, $event)">
      <external-link-icon color="#1976D2"/>
      {{ removeDeletedSuffix(ringGroup.name) }}

      <b-tooltip custom-class="talk-table__tooltip"
                 :target="`comm-ring-group-${_uid}`">
        Click to go to ring group's page
      </b-tooltip>
    </a>

    <span v-else-if="ringGroup.id && isAgent">
      {{ removeDeletedSuffix(ringGroup.name) }}
    </span>

    <span class="deleted"
          v-else-if="ringGroupId && !ringGroup.id && ringGroups.length > 0">
      Deleted Ring Group
    </span>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'
import { aclMixin, classicMixin, userMixin } from 'src/plugins/mixins'
import communicationsMixin from 'src/plugins/mixins/communications.mixin'
import { mapState } from 'vuex'
import { removeDeletedSuffix } from 'src/plugins/helpers/deleted-entities'

export default {
  name: 'RingGroup',

  components: {
    ExternalLinkIcon
  },

  mixins: [
    aclMixin,
    classicMixin,
    communicationsMixin,
    userMixin
  ],

  props: {
    ringGroupId: {
      type: Number,
      default: null
    }
  },

  computed: {
    ...mapState([
      'ringGroups'
    ]),

    ringGroup () {
      return this.ringGroups.find(rg => rg.id === this.ringGroupId) || {}
    }
  },

  methods: {
    removeDeletedSuffix,

    handleRingGroupClick (ringGroupId, e) {
      const url = this.getRingGroupURL(ringGroupId)
      // Only handle navigation in Electron, let browser handle it normally
      this.handleElectronNavigation(e, url)
    }
  }
}
</script>
