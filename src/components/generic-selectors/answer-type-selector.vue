<template>
  <div>
    <q-select ref="answerTypeSelect"
              options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="0"
              style="word-break: break-all;"
              emit-value
              map-options
              dense
              outlined
              v-model="model"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ highlighted ? highlightedClass : '', customClass, 'text-grey-100']"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label class="fw-500 text-grey-100" v-html="scope.opt.label"/>
            <q-item-label class="text-grey-100" caption>
              <div class="break-all">{{ scope.opt.description }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

import * as AnswerTypes from 'src/constants/answer-types'
import { mapState } from 'vuex'

export default {
  name: 'answer-type-selector',

  props: {
    value: {
      type: [String, Number],
      default: AnswerTypes.BY_NONE
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
    }
  },

  computed: {
    placeholder () {
      switch (true) {
        case this.multiple && this.model.length < 1:
          return 'Select Answer Types'
        case !this.multiple && !this.model:
          return 'Select Answer Type'
        case this.multiple && this.model.length > 0:
        case !this.multiple && this.model:
        default:
          return ''
      }
    },

    ...mapState('cache', ['currentCompany'])
  },

  data () {
    return {
      model: this.value,
      optsArray: [
        {
          value: AnswerTypes.BY_BROWSER,
          label: 'Using apps',
          description: 'This user answers calls using the web browser, desktop or mobile apps. This is the default behavior.'
        },
        {
          value: AnswerTypes.BY_PHONE_NUMBER,
          label: 'Using phone number',
          description: 'Forward all calls to this user to the provided phone number (usually a cell phone or off-site landline). Mostly used for call tracking.'
        },
        {
          value: AnswerTypes.BY_IP_PHONE,
          label: 'Using IP phone',
          description: 'Used for desk-phone replacement. Note: You need to have SIP phones configured before selecting this option.'
        },
        {
          value: AnswerTypes.BY_NONE,
          label: 'Will not answer',
          description: 'This user does not answer the phone at all. Calls can\'t be routed to this person. Suitable for managers, controllers, etc.'
        }
      ],
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.optsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.optsArray.filter(item => item.value.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.answerTypeSelect.$el.offsetWidth
    }
  },
  mounted () {
    // exclude BY_IP_PHONE if it's not in the hard coded array
    if ([11, 98, 135, 206, 370, 1004, 1038, 1039, 1040, 1721].includes(this.currentCompany?.id)) {
      this.optsArray = this.optsArray.filter(item => item.value !== AnswerTypes.BY_IP_PHONE)
    }
    this.options = this.optsArray
  },
  watch: {
    value () {
      this.model = this.value
    },

    model (val) {
      this.$emit('select', this.model ? this.model : AnswerTypes.BY_NONE)
    }
  }
}
</script>
