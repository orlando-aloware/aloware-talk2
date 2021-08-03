<template>
  <q-select :options="scriptsOptions"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '' ]"
            class="generic-selector"
            v-model="scriptId"
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
          <q-item-label v-html="scope.opt.title"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'script-selector',

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
      scriptId: this.value,
      scriptsOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'scripts']),

    placeholder () {
      if (this.scriptId) {
        return ''
      }

      return 'Select a script'
    },

    scriptsAlphabeticalOrder () {
      if (this.scripts) {
        let scripts = _.clone(this.scripts)
        return scripts.sort((a, b) => {
          let textA = a.title.toUpperCase()
          let textB = b.title.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.scriptsOptions = this.scriptsAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.scriptId && val === this.scriptId) {
        update(() => {
          this.scriptsOptions = this.scriptsAlphabeticalOrder.filter(script => script.id === this.scriptId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.scriptsOptions = this.scriptsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.scriptsOptions = this.scriptsAlphabeticalOrder.filter(script => script.title.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.scriptId = this.value
    },

    scriptId (val) {
      if (this.value !== undefined && this.scriptId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
