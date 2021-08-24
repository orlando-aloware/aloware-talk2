<template>
  <div>
    <q-select options-selected-class="text-primary"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              use-input
              emit-value
              map-options
              outlined
              dense
              v-model="broadcast"
              :options="broadcastsOptions"
              :placeholder="placeholder"
              :multiple="multiple"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '']"
              :use-chips="useChips"
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
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>
              <q-item-label v-html="scope.opt.name" ></q-item-label>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header class="text-size-xs">{{ scope.opt.group }}</q-item-label>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import auth from 'boot/auth'
import { mapState } from 'vuex'
export default {
  name: 'broadcast-selector',

  props: {
    placeholder: {
      required: false,
      default: 'Select Broadcasts'
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false
    },
    useChips: {
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
    genericStyling: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    ...mapState({
      currentCompany: state => state.currentCompany,
      broadcasts: state => state.broadcasts
    }),
    broadcastsAlphabeticalOrder () {
      if (this.broadcasts) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.broadcasts.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  data () {
    return {
      auth: auth,
      isLoading: false,
      broadcast: null,
      broadcastsOptions: []
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.broadcastsOptions = this.broadcastsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.broadcastsOptions = this.broadcastsAlphabeticalOrder.filter((sequence) => sequence.name && sequence.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  created () {
    this.broadcastsOptions = this.broadcastsAlphabeticalOrder
  },

  watch: {
    broadcast: function (value) {
      this.$emit('change', value)
    }
  }
}
</script>
