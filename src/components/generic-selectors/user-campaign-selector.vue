<template>
  <div>
    <q-select ref="userCampaignSelector"
              options-selected-class="text-primary"
              color="primary"
              option-value="id"
              option-label="name"
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
              :class="[ highlighted ? highlightedClass : '', customClass]"
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
            <q-item-label v-html="scope.opt.name"/>
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
  name: 'user-campaign-selector',

  props: {
    value: {
      type: [String, Number],
      default: 0
    },
    user: {
      type: Object,
      required: true
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
    ...mapState(['campaigns']),
    userCampaigns () {
      return this.campaigns.filter((campaign) => {
        return campaign.user_id === this.user.id
      })
    },
    placeholder () {
      switch (true) {
        case this.multiple && this.model.length < 1:
          return 'Select lines'
        case !this.multiple && !this.model:
          return 'Select line'
        case this.multiple && this.model.length > 0:
        case !this.multiple && this.model:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      model: this.value,
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.userCampaigns
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.userCampaigns.filter(item => item.value.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.userCampaignSelector.$el.offsetWidth
    },
    findAndemitSelectedNumber (value) {
      // return the incoming number of the selected campaign
      const found = this.userCampaigns.find(campaign => campaign.id === value)
      this.$emit('selectedNumber', found ? found.incoming_number : '')
    }
  },
  mounted () {
    this.options = this.userCampaigns

    this.findAndemitSelectedNumber(this.value)
  },
  watch: {
    value () {
      this.model = this.value
    },

    model (val) {
      this.$emit('select', this.model ? this.model : AnswerTypes.BY_NONE)

      this.findAndemitSelectedNumber(val)
    }
  }
}
</script>
