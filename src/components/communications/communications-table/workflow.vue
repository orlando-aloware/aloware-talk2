<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <span class="ellipse"
          v-if="isAgent && value">
      {{ workflow.name || '-' }}
    </span>
    <a class="ellipse"
       target='_blank'
       :href="getWorkflowURL(value)"
       v-else-if="value">
      <external-link-icon color="#1976D2"/>
      {{ workflow.name || '-' }}

      <q-tooltip>
        Click to go to sequence page
      </q-tooltip>
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'

export default {
  name: 'Workflow',

  components: {
    ExternalLinkIcon
  },

  mixins: [
    aclMixin,
    classicMixin
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
    }
  }
}
</script>
