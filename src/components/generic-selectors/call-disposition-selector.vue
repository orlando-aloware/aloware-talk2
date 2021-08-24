<template>
  <q-select :options="callDispositionsOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '' ]"
            v-model="callDispositionId"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            use-input
            use-chips
            emit-value
            map-options
            outlined
            dense
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
        <q-item-section avatar>
          <q-icon name="fa fa-bolt"
                  v-show="!scope.opt.is_external"
                  :style="{ color: scope.opt.color, fontSize: '14px' }">
          </q-icon>
          <q-icon name="fa fa-lock"
                  v-show="scope.opt.is_external"
                  :style="{ color: scope.opt.color, fontSize: '14px' }">
          </q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label v-html="scope.opt.name"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'call-disposition-selector',

  props: {
    value: {
      required: false,
      default: () => { return [] }
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
    }
  },

  data () {
    return {
      callDispositionId: this.value,
      callDispositionsOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'callDispositions']),

    placeholder () {
      if (this.multiple) {
        return 'Select Call Dispositions'
      }

      return 'Select A Call Disposition'
    },

    callDispositionsAlphabeticalOrder () {
      if (this.callDispositions) {
        let callDispositions = _.clone(this.callDispositions)
        return callDispositions.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.callDispositionId && val === this.callDispositionId) {
        update(() => {
          this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder.filter(script => script.id === this.callDispositionId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder.filter(script => script.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.callDispositionId = this.value
    },

    callDispositionId (val) {
      if (this.callDispositionId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
