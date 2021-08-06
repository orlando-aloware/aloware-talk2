<template>
  <q-select :options="vmDropOptions"
            :placeholder="placeholder"
            :loading="loadingVmDrops"
            :disable="disable || loadingVmDrops"
            :class="[ prepend ? 'with-prepend' : '' ]"
            class="generic-selector"
            v-model="vmDropId"
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
import { mapGetters, mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'vm-drop-selector',

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
      vmDropId: this.value,
      vmDrops: [],
      vmDropOptions: [],
      loadingVmDrops: false
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState(['currentCompany']),

    placeholder () {
      if (this.vmDropId) {
        return ''
      }

      return 'Select a voicemail'
    },

    vmDropAlphabeticalOrder () {
      if (this.vmDrops) {
        let vmDrops = _.clone(this.vmDrops)
        return vmDrops.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  created () {
    this.fetchVmDropFiles().then(() => {
      this.vmDropOptions = this.vmDropAlphabeticalOrder
    })
  },

  methods: {

    fetchVmDropFiles () {
      this.loadingVmDrop = true
      return this.$axios.get('/api/v1/voicemail-drop', {
        params: {
          user_id: this.profile.id
        }
      }).then(res => {
        this.loadingVmDrop = false
        this.vmDrops = res.data
        return Promise.resolve()
      }).catch(err => {
        this.loadingVmDrop = false
        console.log(err)
        return Promise.reject()
      })
    },

    filterFn (val, update) {
      if (this.vmDropId && val === this.vmDropId) {
        update(() => {
          this.vmDropOptions = this.vmDropAlphabeticalOrder.filter(vmDrop => vmDrop.id === this.vmDropId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.vmDropOptions = this.vmDropAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.vmDropOptions = this.vmDropAlphabeticalOrder.filter(vmDrop => vmDrop.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.vmDropId = this.value
    },

    vmDropId (val) {
      if (this.vmDropId !== this.value) {
        this.$emit('change', this.vmDrops.find(vmDrop => vmDrop.id === val))
      }
    }
  }
}
</script>
