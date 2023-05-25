<template>
  <div>
    <q-select ref="agentStatusSelect"
              options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="0"
              style="word-break: break-all;"
              :use-input="useInput"
              emit-value
              map-options
              dense
              v-model="status"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              @popup-show="onShowMenu"
              @filter="filterFn">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:selected-item="scope">
        <div class="d-flex align-items-center">
          <q-badge :class="['rounded-badge bordered-grey mr-1', `bg-agent-status-${scope.opt.name}`]"/>
          <span>{{ scope.opt.label }}</span>
      </div>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <div class="d-flex align-items-center">
              <q-badge :class="['rounded-badge bordered-grey mr-1', `bg-agent-status-${scope.opt.name}`]"/>
              <span>{{ scope.opt.label }}</span>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { LABELS } from 'src/constants/agent-status-labels'

export default {
  name: 'agent-status-selector',

  props: {
    value: {
      type: String,
      default: 'all'
    },

    multiple: {
      type: Boolean,
      default: false
    },

    disable: {
      type: Boolean,
      default: false
    },

    highlighted: {
      type: Boolean,
      default: false
    },

    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },

    customClass: {
      type: String,
      default: ''
    },

    useInput: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    placeholder () {
      if (this.multiple && this.status.length < 1) {
        return 'Select Agent Statuses'  
      }

      if (!this.multiple && !this.status) {
        return 'Select Agent Status'  
      }

      return ''
    },

    optionsArray () {
      return [
        {
          value: 'all',
          label: 'All',
          name: 'all'
        },
        ...LABELS
      ]
    }
  },

  data () {
    return {
      status: this.value,
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.optionsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.optionsArray.filter(item => item.value.toLowerCase().indexOf(needle) > -1)
      })
    },

    onShowMenu () {
      this.selectWidth = this.$refs.agentStatusSelect.$el.offsetWidth
    }
  },

  mounted () {
    this.options = this.optionsArray
  },

  watch: {
    value () {
      this.status = this.value
    },

    status (val) {
      this.$emit('select', this.status)
    }
  }
}
</script>
