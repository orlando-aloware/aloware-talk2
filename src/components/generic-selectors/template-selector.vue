<template>
  <q-select ref="templateSelector"
            :options="options"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '' ]"
            class="generic-selector q-basic-selector"
            v-model="selectedId"
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
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents">
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
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'template-selector',

  mixins: [
    selectorMixin
  ],

  props: {
    value: {
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
      selectedId: this.value,
      options: [],
      reference: 'templateSelector'
    }
  },

  computed: {
    ...mapState(['templates']),

    placeholder () {
      if (this.selectedId) {
        return ''
      }

      return 'Select a template'
    },

    templatesAlphabeticalOrder () {
      if (this.templates) {
        return _.clone(this.templates).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.options = this.templatesAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.templatesAlphabeticalOrder.filter(template => template.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.templatesAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.templatesAlphabeticalOrder.filter(template => template.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('change', this.templates.find(template => template.id === val))
      }

      this.showInputPlaceholder()
    }
  }
}
</script>
