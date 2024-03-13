<template>
  <div class="w-full flex-grow-1"
       v-if="hasPermissionTo('list disposition status')">
    <multiselect class="chip__clear-blue shrink-options options__no-border options__relative b-radius__equal"
                 v-model="callDispositionId"
                 label="name"
                 track-by="id"
                 placeholder="Select Disposition"
                 :selectLabel="null"
                 :deselectLabel="null"
                 :selectedLabel="null"
                 open-direction="bottom"
                 :closeOnSelect="!multiple"
                 :searchable="multiple"
                 :options="callDispositionsAlphabeticalOrder"
                 :multiple="multiple"
                 :loading="loadingCallDisposition"
                 :internal-search="false"
                 :clear-on-select="false"
                 :close-on-select="false"
                 :options-limit="300"
                 :limit="5"
                 :limit-text="limitText"
                 :max-height="150"
                 :show-no-results="true"
                 :class="selectClass"
                 v-if="communication"
                 @open="onSelectOpen"
                 @close="onSelectClose"
                 @input="changeCallDisposition">
      <template slot="option" slot-scope="props">
        <div class="option__desc">
          <q-icon name="fa fa-bolt"
                  :style="{ color: props.option.color }"
                  v-show="!props.option.is_external">
          </q-icon>
          <q-icon name="fa fa-lock"
                  :style="{ color: props.option.color }"
                  v-show="props.option.is_external">
          </q-icon>
          <span class="option__small ml-2">{{ props.option.name }}</span>
        </div>
      </template>
      <span slot="noResult">
        No call dispositions found.
      </span>
    </multiselect>
    <multiselect class="chip__clear-blue shrink-options options__no-border options__relative b-radius__equal"
                 v-model="callDispositionId"
                 label="name"
                 track-by="id"
                 placeholder="Select Disposition"
                 :selectLabel="null"
                 :deselectLabel="null"
                 :selectedLabel="null"
                 open-direction="bottom"
                 :searchable="multiple"
                 :options="callDispositionsAlphabeticalOrder"
                 :multiple="multiple"
                 :loading="loadingCallDisposition"
                 :internal-search="false"
                 :clear-on-select="false"
                 :close-on-select="false"
                 :options-limit="300"
                 :limit="5"
                 :limit-text="limitText"
                 :max-height="150"
                 :show-no-results="true"
                 :class="selectClass"
                 v-else
                 @open="onSelectOpen"
                 @close="onSelectClose"
                 @input="selectCallDisposition">
      <template slot="option" slot-scope="props">
        <div class="option__desc">somethign
          <q-icon name="fa fa-bolt"
                  :style="{ color: props.option.color }"
                  v-show="!props.option.is_external">
          </q-icon>
          <q-icon name="fa fa-lock"
                  :style="{ color: props.option.color }"
                  v-show="props.option.is_external">
          </q-icon>
          <span class="option__small ml-2">{{ props.option.name }}</span>
        </div>
      </template>
      <span slot="noResult">
        No call dispositions found.
      </span>
    </multiselect>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import Multiselect from 'vue-multiselect'

export default {
  mixins: [aclMixin],

  components: {
    Multiselect
  },

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
      filteredCallDispositions: [],
      selectClass: []
    }
  },

  computed: {
    ...mapState(['callDispositions']),

    computedCommunication () {
      if (this.communication) {
        const found = this.callDispositionsAlphabeticalOrder.find(callDisposition => callDisposition.id === this.communication.call_disposition_id)
        return {
          id: this.communication.call_disposition_id,
          call_disposition_id: this.communication.call_disposition_id,
          name: found ? found.name : ''
        }
      }

      return {
        id: null,
        call_disposition_id: null,
        name: ''
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
        return _.clone(this.availableDispositions).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  mounted () {
    if (this.communication) {
      this.callDispositionId = this.computedCommunication
    }
  },

  methods: {
    initializeTagValues (overrideValue = undefined) {
      const found = { data: null }
      const value = overrideValue || this.value
      if (value instanceof Array) {
        this.callDispositionId = []
        const item = { index: null }
        for (item.index of value) {
          found.data = this.availableDispositions.find(disposition => disposition.id === item.index)
          if (found.data !== null) {
            this.callDispositionId.push(found.data)
          }
        }
      } else {
        found.data = this.availableDispositions.find(disposition => disposition.id === value)
        if (found.data !== null) {
          this.callDispositionId = found.data
        }
      }
    },

    onSelectOpen () {
      this.selectClass = ['border-blue']
    },

    onSelectClose () {
      this.selectClass = []
    },

    limitText (count) {
      return `and ${count} other tags`
    },

    changeCallDisposition () {
      this.loadingCallDisposition = true
      this.$axios.post('/api/v1/communication/' + this.communication.id + '/dispose-call', {
        call_disposition_id: this.selectCallDisposition(this.callDispositionId, true)
      }).then((res) => {
        this.loadingCallDisposition = false
        this.$generalNotification('Call disposition updated.')
        this.$emit('callDisposed', res.data.call_disposition_id)
      }).catch((err) => {
        this.loadingCallDisposition = false
        this.$handleErrors(err.response)
      })
    },

    selectCallDisposition (callDisposition, returnValue = false) {
      const callDispositionIds = { data: null }
      if (callDisposition instanceof Array) {
        callDispositionIds.data = []
        const item = { data: null }
        for (item.data of callDisposition) {
          callDispositionIds.data.push(item.data.id)
        }
      } else {
        callDispositionIds.data = callDisposition.id
      }

      if (returnValue) {
        return callDispositionIds.data
      }

      this.$emit('change', callDispositionIds.data)
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
      this.initializeTagValues()
    },

    'computedCommunication.call_disposition_id': function () {
      this.initializeTagValues(this.communication.call_disposition_id)
      this.$emit('callDisposed')
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
