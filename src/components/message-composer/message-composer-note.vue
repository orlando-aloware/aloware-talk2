<template>
  <div class="pt-2 message-composer-note-wrapper">
    <div class="form-input-container">
      <form>
        <at hideOnBlur
            ref="noteMessageBody"
            name-key="full_name"
            v-model="messageComposer.note.body"
            :members="items">
          <template slot="item" slot-scope="props" >
            <avatar class="contact-avatar mr-2 position-absolute"
                    width="30"
                    height="30"
                    :name="props.item.full_name">
            </avatar>
            <span :data-text="props.item.full_name"
                  class="at-custom-text">
              {{ props.item.full_name }}
              <br>
              <small>{{ props.item.email }}</small>
            </span>
          </template>
          <template v-slot:embeddedItem="props">
            <span>
                <span class="mention-tag"
                      :data-id="props.current.id"
                      :data-key="generateKey(32)">
                  @{{ props.current.full_name }}
                </span>
            </span>
          </template>
          <div id="noteContentEditable" placeholder="Type @ to mention someone" contenteditable></div>
        </at>
      </form>
    </div>
    <div class="d-flex justify-content-between">
      <div class="message-options">

      </div>
      <div>
        <b-button-group>
          <b-button variant="primary"
                    class="fs-13 pl-3 pr-3"
                    size="sm"
                    :disabled="isAdding || !validNote"
                    @click="onAdd">
            <q-spinner-bars v-if="isAdding" color="white" />
            {{ isAdding ? 'Adding Note...' : 'Add Note' }}
          </b-button>
        </b-button-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

import At from 'vue-at'
import Avatar from 'components/avatar'

export default {
  name: 'message-composer-note',
  components: { Avatar, At },
  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),
    validNote () {
      const content = this.messageComposer.note.body.replace(/(<([^>]+)>)/gi, '')
      return content && content.trim().length > 0
    }
  },
  data () {
    return {
      isAdding: false,
      items: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setMessageComposerNoteBody', 'resetMessageComposerNote']),
    updateMessage (value) {
      this.setMessageComposerNoteBody(value)
    },
    formatMessage () {
      return {
        body: this.messageComposer.note.body,
        type: 10
      }
    },
    onAdd () {
      this.isAdding = true
      talk2Api.V1.contact.addEngagement(this.contact.id, this.formatMessage())
        .then(response => {
          this.resetMessageComposerNote()
          this.$generalNotification('Note has been added.')
        }).catch(error => {
          console.log(error)
          this.$generalNotification('Error while adding note.', 'error')
        }).finally(() => {
          this.isAdding = false
          // this.$refs.noteMessageBody.focus()
        })
    },
    getMentionableItems () {
      return talk2Api.V1.users.withAccessToContact(this.contact.id).then(response => {
        this.items = response.data
      })
    },
    generateKey (length) {
      let result = ''
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let charactersLength = characters.length
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    },
    focusInput () {
      let el = document.getElementById('noteContentEditable')
      setTimeout(function () {
        el.focus()
      }, 10)
    }
  },
  mounted () {
    this.getMentionableItems()
    if (this.messageComposer.mode === 'note') {
      this.focusInput()
    }
  },
  watch: {
    'contact.id': function () {
      this.getMentionableItems()
    }
  }
}
</script>
