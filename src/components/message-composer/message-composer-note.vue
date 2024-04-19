<template>
  <div class="pt-2 message-composer-note-wrapper" data-testid="message-composer-note-wrapper">
    <div class="form-input-container">
      <form data-testid="note-form">
        <at hideOnBlur
            ref="noteMessageBody"
            name-key="full_name"
            v-model="messageComposer.note.body"
            data-testid="note-message-body-input"
            :members="items">
          <template slot="item" slot-scope="props">
            <avatar class="contact-avatar mr-2 position-absolute"
                    width="30"
                    height="30"
                    data-testid="note-avatar"
                    :name="props.item.full_name">
            </avatar>
            <span :data-text="props.item.full_name"
                  data-testid="note-mention-item"
                  class="at-custom-text">
                {{ props.item.full_name }}
                <br>
                <small>{{ props.item.email }}</small>
              </span>
          </template>
          <template v-slot:embeddedItem="props">
            <span>
                <span :data-id="props.current.id"
                      data-testid="note-mention-full_name-item"
                      class="mention-tag">
                  @{{ props.current.full_name }}
                </span>
            </span>
          </template>
          <div ref="noteContentEditable"
               id="noteContentEditable"
               placeholder="Type @ to mention someone"
               contenteditable
               data-testid="note-content-editable"
               @keydown="onKeyDown">
          </div>
        </at>
      </form>
    </div>
    <div class="d-flex justify-content-between">
      <div class="message-options">

      </div>
      <div>
        <q-btn color="primary"
               class="message-composer-send-button"
               :disable="isAdding || !validNote"
               data-testid="add-note-button"
               @click="onAdd">
          <template slot="default">
            <q-spinner-bars v-if="isAdding"
                            class="mr-1"
                            color="white">
            </q-spinner-bars>
            {{ isAdding ? 'Adding Note...' : 'Add Note' }}
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

import At from 'vue-at'
import Avatar from 'components/avatar'
import { mentionsMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'message-composer-note',
  mixins: [mentionsMixin],
  components: { Avatar, At },
  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),
    ...mapState('auth', ['profile']),
    validNote () {
      const content = this.messageComposer.note.body.replace(/(<([^>]+)>)/gi, '')
      return content && content.trim().length > 0
    }
  },
  data () {
    return {
      isAdding: false,
      items: [],
      focusInputInterval: null
    }
  },
  methods: {
    ...mapActions('contacts', ['setMessageComposerNoteBody', 'resetMessageComposerNote']),
    updateMessage (value) {
      this.setMessageComposerNoteBody(value)
    },
    formatMessage () {
      return {
        time: null,
        date: null,
        timezone: this.profile.timezone,
        body: this.parseMentionToMarkup(this.messageComposer.note.body),
        type: 10
      }
    },
    onAdd () {
      this.isAdding = true

      const message = this.formatMessage()
      this.$emit('message-sent', {
        ...message,
        type: CommunicationTypes.NOTE
      })

      talk2Api.V1.contact.addEngagement(this.contact.id, message)
        .then(response => {
          this.resetMessageComposerNote()
          this.$generalNotification('Note has been added.')
        }).catch(error => {
          console.log(error)
          this.$handleErrors(error.response)
        }).finally(() => {
          this.isAdding = false
          // this.$refs.noteMessageBody.focus()
        })
    },
    getMentionableItems () {
      if (this.contact && this.contact.id) {
        return talk2Api.V1.users.withAccessToContact(this.contact.id).then(response => {
          this.items = response.data
        })
      }
    },
    focusInput () {
      const counter = { data: 0 }
      this.focusInputInterval = setInterval(() => {
        if (typeof this.$refs.noteContentEditable !== 'undefined') {
          this.$refs.noteContentEditable.focus()
          clearInterval(this.focusInputInterval)
        }
        counter.data++
        if (counter > 180) {
          clearInterval(this.focusInputInterval)
        }
      }, 250)
    },
    onKeyDown (evt) {
      if (evt.keyCode === 13 && !evt.shiftKey) {
        if (this.validNote) {
          this.onAdd()
        }
        evt.preventDefault()
      }
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
    },
    'messageComposer.note.body': function (value) {
      if (this.$refs.noteContentEditable.lastElementChild && navigator.userAgent.indexOf('Firefox') !== -1) {
        if (this.$refs.noteContentEditable.lastElementChild.tagName !== 'BR') {
          const brNode = document.createElement('BR')
          this.$refs.noteContentEditable.appendChild(brNode)
          this.setMessageComposerNoteBody(this.$refs.noteContentEditable.innerHTML)
        }
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.focusInputInterval)
  }
}
</script>
