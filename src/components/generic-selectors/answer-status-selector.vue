<template>
  <div data-testid="answer-status-selector-wrapper">
    <q-select ref="answerStatusSelect"
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
              v-model="answerStatus"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              data-testid="answer-status-selector-select"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey"  data-testid="answer-status-selector-select-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                data-testid="answer-status-selector-select-item">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  name: 'answer-status-selector',

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
      switch (true) {
        case this.multiple && this.answerStatus.length < 1:
          return 'Select Answer Statuses'
        case !this.multiple && !this.answerStatus:
          return 'Select Answer Status'
        case this.multiple && this.answerStatus.length > 0:
        case !this.multiple && this.answerStatus:
        default:
          return ''
      }
    },
    optionsArray () {
      return [
        { value: 'all', label: 'All' },
        { value: 'live', label: 'Live' },
        { value: 'answered', label: 'Answered' },
        { value: 'unanswered', label: 'Unanswered' },
        { value: 'missed', label: 'Missed' },
        { value: 'abandoned', label: 'Abandoned' },
        { value: 'voicemail', label: 'Voicemail' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'failed', label: 'Failed' },
        { value: 'queued', label: 'Queued' },
        { value: 'hold', label: 'Hold' },
        { value: 'deadend', label: 'Dead-end' }
      ]
    }
  },

  data () {
    return {
      answerStatus: this.value,
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
      this.selectWidth = this.$refs.answerStatusSelect.$el.offsetWidth
    }
  },

  mounted () {
    this.options = this.optionsArray
  },

  watch: {
    value () {
      this.answerStatus = this.value
    },

    answerStatus (val) {
      this.$emit('select', this.answerStatus ? this.answerStatus : 'all')
    }
  }
}
</script>
