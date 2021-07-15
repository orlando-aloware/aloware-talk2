<template>
  <div>
    <div class="pt-2 form-input-container">
      <form>
        <at hideOnBlur
            name-key="full_name"
            v-model="messageComposer.note.body"
            :members="items">
          <template slot="item" slot-scope="props" >
            <avatar class="contact-avatar mr-2"
                    width="30"
                    height="30"
                    :name="`KL`" />
            <span :data-text="props.item.full_name" class="at-custom-text">{{ props.item.full_name }} <br><small>{{ props.item.email }}</small></span>
          </template>
          <template v-slot:embeddedItem="props">
            <span>
                <span class="mention-tag" :data-id="props.current.id" :data-key="generateKey(32)">@{{ props.current.full_name }}</span>
            </span>
          </template>
          <div contenteditable placeholder="Type @ to mention someone"></div>
        </at>
      </form>
    </div>
    <div class="d-flex justify-content-between">
      <div class="messagehasRole-options">

      </div>
      <div>
        <b-button-group>
          <b-button variant="primary"
                    class="fs-13 pl-3 pr-3"
                    size="sm"
                    :disabled="isAdding || !validNote"
                    v-on:click="onAdd">
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
import Avatar from 'src/components/avatar/avatar.vue'

export default {
  name: 'message-composer-note',
  components: { Avatar, At },
  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),
    validNote () {
      return this.messageComposer.note.body && this.messageComposer.note.body.length > 0
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
          this.$q.notify({
            message: 'Note has been added.',
            type: 'positive',
            textColor: 'white',
            position: 'bottom-right'
          })
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            message: 'Error while adding note.',
            type: 'negative',
            textColor: 'white',
            position: 'bottom-right'
          })
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
    }
  },
  mounted () {
    this.getMentionableItems()
  },
  watch: {
    'contact.id': function () {
      this.getMentionableItems()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';
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

  .atwho-wrap {
    textarea {
      border: none !important;
      box-shadow:none !important;
      padding: 0 !important;
      overflow: hidden !important;
      font-size: 14px;
    }
  }

  .at-custom-text {
    margin-left: 36px;
    font-size: 13px;
    line-height: 1;
    height: 27px;
    margin-top: 2px;
  }

  .contact-avatar {
    font-weight: 600;
  }

  [contenteditable=true] {
    font-size: 14px;
  }

  [contenteditable=true]:empty:before{
    content: attr(placeholder);
    pointer-events: none;
    display: block; /* For Firefox */
    opacity: 0.9;
  }

  [contenteditable=true]:focus-visible {
    outline: none;
  }

  .mention-tag {
    color: $green;
  }

</style>
