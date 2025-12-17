<template>
  <div>
    <q-select ref="sequenceSelect"
              options-selected-class="text-primary"
              class="q-basic-selector"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              outlined
              dense
              v-model="selectedId"
              :options="formattedSequences"
              :placeholder="placeholder"
              :multiple="multiple"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '']"
              :use-chips="useChips"
              :clearable="clearable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              data-testid="sequence-selector"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn">
      <template v-slot:prepend
                v-if="prepend">
        <span class="text-size-xs text-grey-80">{{ prepend }}</span>
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>
              <q-item-label v-html="scope.opt.name" ></q-item-label>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header class="text-size-xs">{{ scope.opt.group }}</q-item-label>
        </q-item>
      </template>

      <template v-slot:selected-item="scope"
                v-if="useChips">
        <q-chip
          dense
          :tabindex="scope.tabindex"
          color="white"
          class="tag-selected-chip"
          text-color="secondary"
        >
          <i class="fa fa-circle position-absolute"
             :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div role="button" class="custom__remove d-flex align-items-center position-absolute r-0"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon">
            </remove-tag-icon>
          </div>
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import { selectorMixin } from 'src/plugins/mixins'
import _ from 'lodash'

export default {
  name: 'sequence-selector',
  mixins: [
    selectorMixin
  ],
  components: { RemoveTagIcon },
  props: {
    value: {
      required: false
    },
    exclude: {
      required: false,
      default: null
    },
    blockBroadcast: {
      type: Boolean,
      required: false,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false
    },
    clearable: {
      type: Boolean,
      default: false,
      required: false
    },
    useChips: {
      type: Boolean,
      default: false,
      required: false
    },
    disable: {
      type: Boolean,
      default: false,
      required: false
    },
    prepend: {
      type: String,
      required: false
    },
    genericStyling: {
      type: Boolean,
      default: true
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    }
  },

  created () {
    this.allOptions = _.cloneDeep(this.formattedSequences)
  },

  computed: {
    ...mapState({
      workflows: state => state.workflows
    }),
    ...mapState('cache', ['currentCompany']),
    placeholder () {
      switch (true) {
        case this.multiple && this.selectedId && this.selectedId.length < 1:
          return 'Select Sequences'
        case !this.multiple && !this.selectedId:
          return 'Select Sequence'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },
    formattedSequences () {
      const activeSequences = this.availableWorkflows.filter(workflow => workflow.active && (!this.filterBy || workflow.name.toLowerCase().indexOf(this.filterBy) > -1))
      if (activeSequences.length > 0) {
        activeSequences.unshift({
          group: 'Active',
          disable: true
        })
      }

      const pausedSequences = this.availableWorkflows.filter(workflow => !workflow.active && (!this.filterBy || workflow.name.toLowerCase().indexOf(this.filterBy) > -1))
      if (pausedSequences.length > 0) {
        pausedSequences.unshift({
          group: 'Paused',
          disable: true
        })
      }

      return [...activeSequences, ...pausedSequences]
    },
    availableWorkflows () {
      if (this.workflows) {
        return this.workflows.filter((workflow) => {
          if (this.blockBroadcast) {
            return workflow.id !== this.exclude
          }
          return workflow.id !== this.exclude
        }).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  data () {
    return {
      selectedId: this.value,
      isLoading: false,
      reference: 'sequenceSelect',
      fullOptionsProperty: 'allOptions',
      filterBy: '',
      allOptions: []
    }
  },

  methods: {
    filterFn (val, update) {
      this.filterBy = val.toLowerCase()

      update()
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },
    selectedId: function (value) {
      this.$emit('change', value)
      this.showInputPlaceholder()
    }
  }
}
</script>
