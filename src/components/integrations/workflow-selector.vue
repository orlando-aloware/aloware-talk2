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
              :placeholder="placeholder"
              class="q-selector workflow-selector"
              v-model="selectedWorkflow"
              :options="options"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
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
    },
    selectedWorkflowObject () {
      if (!this.selectedWorkflow) {
        return null
      }

      return this.workflowOptions.find(item => item.id === this.selectedWorkflow)
    }
  },
  data () {
    return {
      selectedWorkflow: '',
      isLoadingWorkflow: false,
      isFocused: false,
      workflows: [],
      options: this.workflowOptions,
      selectWidth: 0,
      placeholder: 'Select workflow'
    }
  },
  methods: {
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.q-selector .q-field__input').placeholder = this.selectedWorkflowObject ? this.selectedWorkflowObject.name : this.placeholder
      this.$el.querySelector('.q-selector .q-field__input').style.display = 'block'
      if (this.selectedWorkflowObject) {
        this.$el.querySelector('.q-selector .q-field__native span').style.display = 'none'
      }
    },

    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.q-selector .q-field__input').placeholder = ''
      this.showInputPlaceholder()
      if (this.selectedWorkflowObject) {
        this.$el.querySelector('.q-selector .q-field__native span').style.display = ''
      }
    },
    showInputPlaceholder () {
      if (!this.selectedWorkflowObject) {
        this.$el.querySelector('.q-selector .q-field__input').placeholder = this.placeholder
        this.$el.querySelector('.q-selector .q-field__input').style.display = 'block'
      } else {
        this.$el.querySelector('.q-selector .q-field__input').style.display = 'none'
      }
    },

    onInput () {
      this.$el.querySelector('.q-selector .q-field__input').blur()
    },
    onShowMenu () {
      this.selectWidth = this.$refs.workflowSelector.$el.offsetWidth
    },

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
    'selectedWorkflow': function (value) {
      this.$emit('onWorkflowSelected', value)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
