<template>
  <div class="d-flex position-relative w-100 flex-column">
    <q-input outlined
             dense
             type="textarea"
             rows="3"
             input-class="p-0 pt-1"
             placeholder="Write notes"
             ref="communication_notes"
             v-model="note"
             :disabled="!hasPermissionTo('note communication') || loadingBtn"
             @input="changeNote">
    </q-input>
    <div class="comm-notes-state d-flex w-100 justify-end">
      <span class="text-muted"
            v-show="loadingBtn">
          <i class="rotating material-icons loader text-dark-greenish">&#xE863;</i>
          saving
      </span>
      <span class="text-muted"
            v-show="!loadingBtn && loading">
          autosaved
      </span>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
export default {
  name: 'communication-note',

  mixins: [aclMixin],

  props: {
    communication: {
      required: true
    }
  },

  data () {
    return {
      loading: false,
      loadingBtn: false,
      note: null
    }
  },

  computed: {
    ...mapState(['currentCompany']),

    hasUnsavedChanges () {
      return this.communication && this.note !== this.communication.notes
    }
  },

  created () {
    this.showNote()
  },

  methods: {
    showNote () {
      this.note = this.communication.notes
    },

    changeNote: _.debounce(function () {
      if (this.hasPermissionTo('note communication')) {
        this.saveNote()
      }
    }, 2000),

    saveNote () {
      this.loadingBtn = true
      this.$axios.patch('/api/v1/communication/' + this.communication.id, {
        notes: this.note
      }).then(res => {
        this.communication.notes = this.note
        this.loadingBtn = false
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 1000)
      }).catch(err => {
        this.note = null
        this.$handleErrors(err.response)
        this.loadingBtn = false
      }).then(() => {
        if (this.$refs.communication_notes) {
          this.$refs.communication_notes.focus()
        }
      })
    }
  },

  watch: {
    'communication.notes': function () {
      this.showNote()
    }
  }
}
</script>

<style lang="scss">
  .comm-notes-state {
    position: absolute;
    bottom: 10px;
    right:4px;
  }
</style>
