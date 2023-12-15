<template>
  <q-select ref="scriptSelector"
            class="padded-container q-basic-selector"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="title"
            input-debounce="0"
            use-input
            emit-value
            map-options
            outlined
            dense
            v-model="selectedId"
            :options="options"
            :placeholder="placeholder"
            :loading="loadingScripts"
            :disable="disable || loadingScripts"
            :class="[ prepend ? 'with-prepend' : '' ]"
            @filter="filterFn"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput">
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
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'script-selector',

  mixins: [
    selectorMixin
  ],

  props: {
    communication: {
      required: true
    },

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
      scripts: [],
      options: [],
      loadingScripts: false,
      textProperty: 'title',
      reference: 'scriptSelector',
      fullOptionsProperty: 'scriptsAlphabeticalOrder'
    }
  },

  computed: {
    placeholder () {
      if (this.selectedId) {
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
    }
  },

  created () {
    this.fetchScripts().then(() => {
      this.options = this.scriptsAlphabeticalOrder
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
      return this.$axios.get('/api/v1/communication/' + this.communication.id + '/scripts').then(res => {
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
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.scriptsAlphabeticalOrder.filter(script => script.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.scriptsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.scriptsAlphabeticalOrder.filter(script => script.title.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('change', this.scripts.find(script => script.id === val))
      }

      this.showInputPlaceholder()
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('script_deleted')
  }
}
</script>
