<template>
  <div>
    <generic-multi-select :label="label"
                          buttonText="Ring Groups"
                          :values="ringGroupId"
                          :options="ringGroupOptions"
                          :disable="disable"
                          :canEdit="hasPermissionTo(['list ring group', 'view ring group'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="updateRingGroups">
    </generic-multi-select>
    <q-select v-else
              ref="ringGroupSelect"
              options-selected-class="text-primary"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              use-chips
              emit-value
              map-options
              outlined
              dense
              :options="ringGroupOptions"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              class="generic-selector"
              :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '']"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              v-model="ringGroupId"

              @popup-show="onShowMenu"
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
import { mapState } from 'vuex'
import _ from 'lodash'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'ring-group-selector',

  mixins: [aclMixin],

  components: {
    GenericMultiSelect
  },

  props: {
    value: {
      required: false
    },

    multiple: {
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
    label: {
      type: String,
      default: 'Contact Ring Groups'
    },
    genericMultiselect: {
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

  data () {
    return {
      ringGroupId: this.value,
      ringGroupOptions: [],
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['ringGroups']),

    placeholder () {
      switch (true) {
        case this.multiple && this.ringGroupId.length < 1:
          return 'Select Ring Groups'
        case !this.multiple && !this.ringGroupId:
          return 'Select Ring Group'
        case this.multiple && this.ringGroupId.length > 0:
        case !this.multiple && this.ringGroupId:
        default:
          return ''
      }
    },

    ringGroupsAlphabeticalOrder () {
      if (this.ringGroups) {
        let ringGroups = _.clone(this.ringGroups)
        return ringGroups.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.ringGroupOptions = this.ringGroupsAlphabeticalOrder
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.ringGroupSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      if (this.ringGroupId && val === this.ringGroupId) {
        update(() => {
          this.ringGroupOptions = this.ringGroupsAlphabeticalOrder.filter(ringGroup => ringGroup.id === this.ringGroupId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.ringGroupOptions = this.ringGroupsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.ringGroupOptions = this.ringGroupsAlphabeticalOrder.filter(ringGroup => ringGroup.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    updateRingGroups (val) {
      this.$emit('change', val)
    }
  },

  watch: {
    value () {
      this.ringGroupId = this.value
    },

    ringGroupId (val) {
      if (this.ringGroupId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
