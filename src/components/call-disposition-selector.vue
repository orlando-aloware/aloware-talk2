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
                  :style="{ color: props.option.color }">
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
        <div class="option__desc">
          <q-icon name="fa fa-bolt"
                  :style="{ color: props.option.color }">
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
    initializeTagValues (overrideValue = undefined) {
      let found = null
      const value = overrideValue || this.value
      if (value instanceof Array) {
        this.callDispositionId = []
        for (let item of value) {
          found = this.availableDispositions.find(disposition => disposition.id === item)
          if (found !== null) {
            this.callDispositionId.push(found)
          }
        }
      } else {
        found = this.availableDispositions.find(disposition => disposition.id === value)
        if (found !== null) {
          this.callDispositionId = found
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
        this.$generalNotification('Call disposed')
        this.$emit('callDisposed', res.data.call_disposition_id)
      }).catch((err) => {
        this.loadingCallDisposition = false
        this.$handleErrors(err.response)
      })
    },

    selectCallDisposition (callDisposition, returnValue = false) {
      let callDispositionIds = null
      if (callDisposition instanceof Array) {
        callDispositionIds = []
        for (let item of callDisposition) {
          callDispositionIds.push(item.id)
        }
      } else {
        callDispositionIds = callDisposition.id
      }

      if (returnValue) {
        return callDispositionIds
      }

      this.$emit('change', callDispositionIds)
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
