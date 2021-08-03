<template>
  <q-select :options="templatesOptions"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '' ]"
            class="generic-selector"
            v-model="templateId"
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
  name: 'template-selector',

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
      templateId: this.value,
      templatesOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'templates']),

    placeholder () {
      if (this.templateId) {
        return ''
      }

      return 'Select a template'
    },

    templatesAlphabeticalOrder () {
      if (this.templates) {
        let templates = _.clone(this.templates)
        return templates.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.templatesOptions = this.templatesAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.templateId && val === this.templateId) {
        update(() => {
          this.templatesOptions = this.templatesAlphabeticalOrder.filter(template => template.id === this.templateId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.templatesOptions = this.templatesAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.templatesOptions = this.templatesAlphabeticalOrder.filter(template => template.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.templateId = this.value
    },

    templateId (val) {
      if (this.value !== undefined && this.templateId !== this.value) {
        this.$emit('change', this.templates.find(template => template.id === val))
      }
    }
  }
}
</script>
