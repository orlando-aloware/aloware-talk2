<template>
  <q-select ref="vmDropSelect"
            options-selected-class="text-primary"
            class="q-basic-selector"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            outlined
            dense
            :options="options"
            :placeholder="placeholder"
            :loading="loadingVmDrops"
            :disable="disable || loadingVmDrops"
            :class="[ prepend ? 'with-prepend' : '', genericSelector ? 'padded-container' : '', highlighted ? highlightedClass : '' ]"
            :multiple="multiple"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            v-model="selectedId"
            @popup-show="onShowMenu"
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
import { mapGetters } from 'vuex'
import _ from 'lodash'
import { selectorMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'vm-drop-selector',

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
    },

    useChips: {
      type: Boolean,
      default: false
    },

    genericSelector: {
      type: Boolean,
      default: true
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    showPlaceholder: {
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
      selectedId: this.value,
      vmDrops: [],
      options: [],
      loadingVmDrops: false,
      reference: 'vmDropSelect',
      fullOptionsProperty: 'vmDropAlphabeticalOrder'
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.selectedId.length < 1:
          return 'Select voicemails'
        case !this.multiple && !this.selectedId:
          return 'Select a voicemail'
        case this.multiple && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    vmDropAlphabeticalOrder () {
      if (this.vmDrops) {
        return _.clone(this.vmDrops).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.fetchVmDropFiles().then(() => {
      this.options = this.vmDropAlphabeticalOrder
      if (!this.multiple && this.$isNumeric(this.value)) {
        this.$emit('change', this.vmDrops.find(vmDrop => vmDrop.id === this.value))
        return
      }

      this.$emit('change', this.value)
    })
  },

  methods: {
    fetchVmDropFiles () {
      this.loadingVmDrops = true
      return API.V1.library.voicemailDrop.get({
        params: {
          user_id: this.profile.id
        }
      }).then(res => {
        this.loadingVmDrops = false
        this.vmDrops = res.data
        return Promise.resolve()
      }).catch(err => {
        this.loadingVmDrops = false
        console.log(err)
        return Promise.reject()
      })
    },

    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.vmDropAlphabeticalOrder.filter(vmDrop => vmDrop.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.vmDropAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.vmDropAlphabeticalOrder.filter(vmDrop => vmDrop.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value (value) {
      this.selectedId = value
    },

    selectedId (value) {
      if (this.selectedId !== this.value) {
        if (!this.multiple) {
          this.$emit('change', this.vmDrops.find(vmDrop => vmDrop.id === value))
        } else {
          this.$emit('change', value)
        }
      }

      this.showInputPlaceholder()
    }
  }
}
</script>
