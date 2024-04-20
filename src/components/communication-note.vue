<template>
  <div class="d-flex position-relative w-100 flex-column">
    <q-input :disabled="!hasPermissionTo('note communication') || loadingBtn"
             :borderless="borderless"
             :outlined="!borderless"
             v-model="note"
             type="textarea"
             rows="3"
             input-class="p-0 pt-1 flex-grow-1"
             class="flex-grow-1"
             placeholder="Write notes"
             ref="communicationNotes"
             dense
             data-testid="communication-notes-note-input"
             @input="changeNote"
             @blur="onBlur"
             @keyup.esc="onBlur">
    </q-input>
    <div class="comm-notes-state d-flex w-100 justify-end">
      <span class="text-muted"
            data-testid="communication-notes-saving-text"
            v-show="loadingBtn">
          <i class="rotating material-icons loader text-dark-greenish">&#xE863;</i>
          saving
      </span>
      <span class="text-muted"
            data-testid="communication-notes-saved-text"
            v-show="!loadingBtn && loading">
          saved
      </span>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'communication-note',

  mixins: [aclMixin],

  props: {
    communication: {
      required: true
    },

    borderless: {
      required: false,
      type: Boolean,
      default: false
    },

    noAutoSave: {
      required: false,
      type: Boolean,
      default: false
    },

    autoFocus: {
      required: false,
      default: false
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
    hasUnsavedChanges () {
      return this.communication && this.note !== this.communication.notes
    }
  },

  created () {
    this.showNote()
  },

  mounted () {
    if (this.autoFocus) {
      this.$refs.communicationNotes.focus()
    }
  },

  methods: {
    showNote () {
      this.$emit('onUnsavedChanges', false)
      this.$emit('notesChanged', '')
      this.note = this.communication.notes
    },

    changeNote: _.debounce(function () {
      if (this.hasPermissionTo('note communication') && !this.noAutoSave) {
        this.saveNote()
      }

      this.$emit('notesChanged', this.note)
    }, 2000),

    onBlur () {
      this.$emit('notesBlurred')
    },

    saveNote () {
      this.loadingBtn = true
      this.$axios.patch('/api/v1/communication/' + this.communication.id, {
        notes: this.note
      }).then(res => {
        this.communication.notes = this.note
        this.loadingBtn = false
        this.loading = true
        this.$emit('onUnsavedChanges', false)
        this.$emit('notesChanged', '')
        this.$generalNotification('Notes updated')
        setTimeout(() => {
          this.loading = false
        }, 1000)
      }).catch(err => {
        this.note = null
        this.$handleErrors(err.response)
        this.loadingBtn = false
      }).then(() => {
        if (this.$refs.communicationNotes) {
          this.$refs.communicationNotes.focus()
        }
      })
    }
  },

  watch: {
    'communication.notes': function () {
      this.showNote()
    },

    hasUnsavedChanges (newValue) {
      this.$emit('onUnsavedChanges', newValue)
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
