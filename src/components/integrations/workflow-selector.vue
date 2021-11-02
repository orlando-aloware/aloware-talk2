<template>
  <div>
    <q-select dense
              outlined
              map-options
              emit-value
              use-input
              option-value="id"
              option-label="name"
              style="width: 100%"
              placeholder="Select workflow"
              v-model="selectedWorkflow"
              :options="options"
              @filter="filterFn">
      <template v-slot:append>
        <b-button size="sm" variant="light" @click.stop="getWorkflows">
          <i v-if="!isLoadingWorkflow" class="fa fa-redo-alt"></i>
          <b-spinner v-if="isLoadingWorkflow" variant="success" label="Spinning" small></b-spinner>
        </b-button>
      </template>
    </q-select>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'workflow-selector',
  computed: {
    workflowOptions () {
      return this.workflows
    }
  },
  data () {
    return {
      selectedWorkflow: '',
      isLoadingWorkflow: false,
      workflows: [],
      options: this.workflowOptions
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
          this.$root.handleErrors(err.response)
          console.log(err)
        })
        .finally(() => {
          this.isLoadingWorkflow = false
        })
    }
  },
  mounted () {
    // this.getWorkflows()
  },
  watch: {
    'selectedWorkflow': function (value) {
      this.$emit('onWorkflowSelected', value)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
