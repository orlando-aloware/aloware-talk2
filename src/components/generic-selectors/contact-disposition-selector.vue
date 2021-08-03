<template>
  <q-select :options="contactDispositionsOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '' ]"
            class="generic-selector"
            v-model="contactDispositionId"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            use-input
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
  name: 'contact-disposition-selector',

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
    }
  },

  data () {
    return {
      contactDispositionId: this.value,
      contactDispositionsOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dispositionStatuses']),

    placeholder () {
      if (this.contactDispositionId) {
        return ''
      }

      if (this.multiple) {
        return 'Select contact dispositions'
      }

      return 'Select a contact disposition'
    },

    contactDispositionsAlphabeticalOrder () {
      if (this.dispositionStatuses) {
        let callDispositions = _.clone(this.dispositionStatuses)
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
    this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.contactDispositionId && val === this.contactDispositionId) {
        update(() => {
          this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder.filter(contactDisposition => contactDisposition.id === this.contactDispositionId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder.filter(contactDisposition => contactDisposition.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.contactDispositionId = this.value
    },

    contactDispositionId (val) {
      if (this.value !== undefined && this.contactDispositionId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
