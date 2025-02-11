<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <a class="ellipse cursor-pointer"
       :id="`comm-sequence-${_uid}`"
       target="_blank"
       :href="getWorkflowURL(value)"
       @click="handleWorkflowClick"
       v-if="value && workflowName !== ''">
      <external-link-icon color="#1976D2"/>
      {{ workflowName }}

      <b-tooltip custom-class="talk-table__tooltip"
                 :target="`comm-sequence-${_uid}`">
        Click to go to sequence page
      </b-tooltip>
    </a>
    <span class="ellipse"
          v-else-if="(isAgent && value)">
      {{ workflowName }}
    </span>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import communicationsMixin from 'src/plugins/mixins/communications.mixin'
import { mapState } from 'vuex'
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'

export default {
  name: 'Workflow',

  components: {
    ExternalLinkIcon
  },

  mixins: [
    aclMixin,
    classicMixin,
    communicationsMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    }
  },

  computed: {
    ...mapState(['workflows']),

    workflow () {
      return this.workflows.find(workflow => workflow.id === this.value) || {}
    },

    workflowName () {
      return this.workflow.name || ''
    }
  },

  methods: {
    handleWorkflowClick (e) {
      const url = this.getWorkflowURL(this.value)
      // Only handle navigation in Electron, let browser handle it normally
      this.handleElectronNavigation(e, url)
    }
  }
}
</script>
