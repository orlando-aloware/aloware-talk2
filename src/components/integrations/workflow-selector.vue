<template>
  <div>
    <q-select dense
              outlined
              map-options
              emit-value
              use-input
              ref="workflowSelector"
              option-value="id"
              option-label="name"
              class="q-selector workflow-selector q-basic-selector"
              :placeholder="placeholder"
              :options="options"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              v-model="selectedId"
              data-testid="workflow-selector"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn">
      <template v-slot:append>
        <b-button data-testid="workflow-selector-button" size="sm" variant="light" @click.stop="getWorkflows">
          <i v-if="!isLoadingWorkflow" class="fa fa-redo-alt"></i>
          <b-spinner v-if="isLoadingWorkflow" variant="success" label="Spinning" small></b-spinner>
        </b-button>
      </template>
    </q-select>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { selectorMixin } from 'src/plugins/mixins'
export default {
  name: 'workflow-selector',
  mixins: [
    selectorMixin
  ],
  computed: {
    workflowOptions () {
      return this.workflows
    }
  },
  data () {
    return {
      selectedId: '',
      isLoadingWorkflow: false,
      isFocused: false,
      workflows: [],
      options: this.workflowOptions,
      placeholder: 'Select workflow',
      reference: 'workflowSelector',
      fullOptionsProperty: 'workflowOptions'
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.workflowOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.workflowOptions.filter(v => v.name && v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    getWorkflows () {
      this.isLoadingWorkflow = true
      return talk2Api.V1.integrations.hubspot.getWorkflows()
        .then(response => {
          this.workflows = response.data
        })
        .catch((err) => {
          this.$handleErrors(err.response)
          console.log(err)
        })
        .finally(() => {
          this.isLoadingWorkflow = false
        })
    }
  },
  mounted () {
    this.getWorkflows()
  },
  watch: {
    selectedId (value) {
      this.$emit('onWorkflowSelected', value)
      this.showInputPlaceholder()
    }
  }
}
</script>
