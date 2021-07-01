<template>
  <div>
    <slot name="trigger">
      <!--q-btn id="notes-btn"
             class="text text-greyish opacity-4 hover-opacity text-md m-0 p-0"
             v-if="!communication.notes">
        <q-icon name="fa fa-file-alt" />
      </q-btn>
      <q-btn id="notes-btn"
             class="text text-dark-greenish hover-text-blackish text-md m-0 p-0"
             v-else>
        <q-icon name="fa fa-file-alt" />
      </q-btn-->
    </slot>
    <b-popover ref="popover_notes"
               target="notes-btn"
               title="Notes:"
               :placement="small ? 'top' : 'left'"
               :width="small ? 265 : 400"
               trigger="click blur"
               @show="showNote">
      <div class="row">
        <div class="col-12">
          <q-input type="textarea"
                    placeholder="Write your call notes here..."
                    ref="communication_notes"
                    v-model="note"
                    rows="5"
                    :disabled="!hasPermissionTo('note communication') || loadingBtn"
                    autofocus>
          </q-input>

          <div class="mt-1 text-right h-24">
            <span class="text-muted"
                  v-show="loadingBtn">
                <i class="material-icons loader text-dark-greenish">&#xE863;</i>
              saving
            </span>
            <span class="text-muted"
                  v-show="!loadingBtn && loading">
              saved
            </span>
            <span class="text-deep-orange _600"
                  v-if="hasUnsavedChanges && !loadingBtn">
              unsaved changes
            </span>
          </div>
        </div>
      </div>
      <div class="row mt-1">
        <div class="col-12 text-right">
          <q-btn size="small"
                 :loading="loadingBtn"
                 :disabled="loadingBtn"
                 @click="saveNote">
            Save
          </q-btn>
        </div>
      </div>
    </b-popover>
  </div>
</template>

<script>
import _ from 'lodash'
import auth from 'boot/auth'
import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
export default {
  name: 'communication-note',

  mixins: [aclMixin],

  props: {
    communication: {
      required: true
    },

    small: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      auth: auth,
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
