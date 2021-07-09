<template>
  <div class="w-full flex-grow-1"
       v-if="hasPermissionTo('list disposition status')">
    <q-select v-model="callDispositionId"
              class="w-full"
              use-input
              dense
              outlined
              options-dense
              menu-shrink
              input-debounce="0"
              option-value="id"
              option-label="name"
              :placeholder="placeholder"
              :disabled="loadingCallDisposition"
              :options="callDispositionsAlphabeticalOrder"
              v-if="communication"
              @filter="filterFn"
              @change="selectCallDisposition">
      <template v-slot:option="scope">
        <div class="d-flex flex-row w-100">
          <q-icon name="fa fa-bolt" :style="{ color: scope.opt.color }"/>
          <q-item
            :key="scope.opt.id"
            clickable
            v-ripple
            v-close-popup
            @click="callDispositionId = scope.opt"
          >
            <q-item-section>
              <q-item-label v-html="scope.opt.name" class="q-ml-md" ></q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </template>
    </q-select>

    <q-select v-model="callDispositionId"
              class="w-full"
              use-input
              use-chips
              input-debounce="0"
              option-value="id"
              option-label="name"
              :multiple="multiple"
              :placeholder="placeholder"
              :disabled="loadingCallDisposition"
              :options="callDispositionsAlphabeticalOrder"
              v-else
              @filter="filterFn"
              @change="selectCallDisposition">
      <template v-slot:prepend
                v-slot:selected-item="scope">
        <q-icon name="fa fa-bolt"
                :style="{ color: scope.color }">
        </q-icon>
      </template>
    </q-select>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  mixins: [aclMixin],

  props: {
    communication: {
      required: false
    },

    exclude: {
      required: false
    },

    multiple: {
      type: Boolean,
      required: false,
      default: false
    },

    noCollapse: {
      type: Boolean,
      required: false,
      default: false
    },

    clearable: {
      type: Boolean,
      required: false,
      default: false
    },

    value: {
      required: false,
      default: null
    }
  },

  data () {
    return {
      callDispositionId: this.value,
      loadingCallDisposition: false,
      filteredCallDispositions: []
    }
  },

  computed: {
    ...mapState(['callDispositions']),

    computedCommunication () {
      if (this.communication) {
        return this.communication
      }

      return {
        id: null,
        callDispositionId: null
      }
    },

    placeholder () {
      return 'Select Disposition'
    },

    availableDispositions () {
      if (this.callDispositions) {
        return this.callDispositions.filter((callDisposition) => {
          return callDisposition.id !== this.exclude
        })
      }

      return []
    },

    callDispositionsAlphabeticalOrder () {
      if (this.availableDispositions) {
        let callDispositions = _.clone(this.availableDispositions)
        callDispositions = callDispositions.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })

        return callDispositions
      }

      return []
    }
  },

  created () {
    if (this.communication) {
      this.callDispositionId = this.communication.callDispositionId
    }
  },

  methods: {
    changeCallDisposition () {
      this.loadingCallDisposition = true
      this.$axios.post('/api/v1/communication/' + this.communication.id + '/dispose-call', {
        callDispositionId: this.callDispositionId
      }).then((res) => {
        this.loadingCallDisposition = false
        this.$q.notify({
          offset: 95,
          title: 'Communication',
          message: 'Call disposed',
          type: 'success',
          showClose: true
        })
        this.$emit('callDisposed', res.data.call_disposition_id)
      }).catch((err) => {
        this.loadingCallDisposition = false
        this.$handleErrors(err.response)
      })
    },

    selectCallDisposition (callDisposition) {
      this.callDispositionId = callDisposition
      this.$emit('change', callDisposition)
    },

    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.filteredCallDispositions = this.callDispositions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.filteredCallDispositions = this.callDispositions.filter(campaign => campaign.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.callDispositionId = this.value
    },

    'computedCommunication.call_disposition_id': function () {
      this.callDispositionId = this.communication.call_disposition_id
      this.$emit('callDisposed')
    }
  }
}
</script>
