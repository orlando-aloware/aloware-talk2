<template>
  <q-select options-selected-class="text-primary"
            color="primary"
            option-label="text"
            option-value="id"
            input-debounce="0"
            use-input
            map-options
            outlined
            dense
            class="padded-container"
            :class="[ prepend ? 'with-prepend' : '' ]"
            :options="scriptsOptions"
            :placeholder="placeholder"
            :loading="loadingScripts"
            :disable="disable || loadingScripts"
            :display-value="scriptTitle"
            :emit-value="true"
            :clearable="clearable"
            v-model="localValue"
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
import _ from 'lodash'

export default {
  name: 'script-selector',

  model: {
    prop: 'modelValue',
    event: 'change'
  },

  props: {
    modelValue: [Number, String],

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    clearable: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      scriptId: this.modelValue,
      scripts: [],
      scriptsOptions: [],
      loadingScripts: false,
      selectedScriptObj: null
    }
  },

  computed: {
    localValue: {
      get () {
        return `${this.modelValue || ''}`
      },

      set (val) {
        this.$emit('change', val)
      }
    },

    placeholder () {
      if (this.modelValue) {
        return ''
      }

      return 'Select a script'
    },

    scriptsAlphabeticalOrder () {
      if (this.scripts) {
        return _.clone(this.scripts).sort((a, b) => {
          const textA = a.title.toUpperCase()
          const textB = b.title.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    scriptTitle () {
      return this.selectedScriptObj?.title || ''
    }
  },

  created () {
    this.fetchScripts().then(() => {
      this.scriptsOptions = this.scriptsAlphabeticalOrder
    })
  },

  mounted () {
    this.$VueEvent.listen('script_deleted', (script) => {
      const updatedScripts = this.scripts.filter(item => +item.id !== +script.id)
      this.scripts = updatedScripts
    })
  },

  methods: {
    fetchScripts () {
      this.loadingScripts = true
      return this.$axios.get('/api/v1/script').then(res => {
        this.loadingScripts = false
        this.scripts = res.data
        return Promise.resolve()
      }).catch(err => {
        this.loadingScripts = false
        console.log(err)
        return Promise.reject()
      })
    },

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
    },

    prepareOptions (val) {
      this.selectedScriptObj = this.scriptsOptions.find(script => script.id === parseInt(val))
    }
  },

  watch: {
    localValue (val) {
      this.prepareOptions(val)
      this.$emit('on-change', this.selectedScriptObj)
    },

    scriptId (val) {
      if (this.scriptId !== this.value) {
        this.$emit('change', this.scripts.find(script => script.id === val))
      }
    },

    scriptsOptions () {
      this.prepareOptions(this.localValue)
    },

    selectedScriptObj (obj) {
      if (obj?.id) {
        this.$emit('on-change', this.selectedScriptObj)
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('script_deleted')
  }
}
</script>
