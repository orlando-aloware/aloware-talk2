<template>
  <div>
    <div class="pt-2 form-input-container">
      <form>
        <q-input borderless
                 autogrow
                 ref="noteMessageBody"
                 class="q-input-composer"
                 input-class="q-input-pl-0 q-input-pr-0 pt-0 pb-0"
                 type="textarea"
                 placeholder="Type @ to mention someone"
                 v-model="message_composer.note.body"
                 @input="updateMessage"
        />
      </form>
    </div>
    <div class="d-flex justify-content-between">
      <div class="message-options">

      </div>
      <div>
        <b-button-group>
          <b-button variant="primary"
                    size="sm"
                    :disabled="!validNote"
                    v-on:click="onAdd">
            <q-spinner-bars v-if="is_adding" color="white" />
            {{ is_adding ? 'Adding Note...' : 'Add Note' }}
          </b-button>
        </b-button-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'message-composer-note',
  computed: {
    ...mapGetters('contacts', ['contact', 'message_composer', 'selected_line']),
    validNote () {
      return this.message_composer.note.body && this.message_composer.note.body.length > 0
    }
  },
  data () {
    return {
      is_adding: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setMessageComposerNoteBody', 'resetMessageComposerNote']),
    updateMessage (value) {
      this.setMessageComposerNoteBody(value)
    },
    formatMessage () {
      return {
        body: this.message_composer.note.body,
        type: 10
      }
    },
    onAdd () {
      this.is_adding = true
      talk2Api.V1.contact.addEngagement(this.contact.id, this.formatMessage())
        .then(response => {
          this.resetMessageComposerNote()
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            message: 'Error while adding note.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        }).finally(() => {
          this.is_adding = false
          this.$refs.noteMessageBody.focus()
        })
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
  .b-textarea, .b-textarea:focus {
    border: none !important;
    box-shadow:none !important;
    padding: 0 !important;
    overflow: hidden;
  }

  .message-options {
    padding-top: 6px;
  }
  .message-options a:focus,
  .message-options a:focus-visible {
    outline: none !important;
    outline-offset: 0;
  }

  .message-options a:not(:first-child){
    margin-left: 10px;
  }
  .popover {
    max-width: 100%;
  }

  .email-subject-input {
    padding: 0 !important;
  }

</style>
