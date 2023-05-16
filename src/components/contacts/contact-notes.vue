<template>
  <b-card class="border-0 contact-notes-wrapper"
          v-if="contact">
    <h4 v-if="!no_title">Notes</h4>
    <div class="notes mt-1"
         style="min-height: 15px;"
         v-if="!isEdit"
         v-html="notes"
         @click="onEditNotes">
    </div>
    <div v-if="(!contact.notes || contact.notes.length < 1) && !isEdit"
         class="notes-empty-placeholder"
         @click="onEditNotes">
      Add notes here..
    </div>
    <div v-if="isEdit"
         class="mt-1"
         style="max-width: 300px">
      <contact-notes-input ref="notesInput"
                           v-model="contact.notes"
                           @input="onInput"
                           @blur="onBlur">
      </contact-notes-input>
    </div>
  </b-card>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import ContactNotesInput from 'components/contacts/contact-notes-input'

export default {
  name: 'contact-notes',

  components: { ContactNotesInput },

  props: {
    contact: {
      required: true
    },

    title: {
      required: false,
      default: 'Notes'
    },

    no_title: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    notes () {
      return this.contact.notes.replace(/\n/g, '<br />')
    }
  },

  data () {
    return {
      isEdit: false,
      prevValue: ''
    }
  },

  mounted () {
    this.isEdit = false
    if (this.contact) {
      this.prevValue = this.contact.notes
    }
  },

  methods: {
    onEditNotes () {
      this.isEdit = true
    },

    onInput (value) {
      if (this.prevValue !== value) {
        this.$emit('input', value)
      }
    },

    onBlur () {
      this.isEdit = false
      if (this.prevValue !== this.contact.notes) {
        if (this.prevValue !== this.contact.notes) {
          this.$emit('blur', this.contact.notes)
        }
      }
    },

    onUpdate () {
      talk2Api.V1.contact.update(this.contact.id, { notes: (this.contact.notes ? this.contact.notes.trim() : this.contact.notes) }).then(response => {
        this.$emit('update', response.data)
        this.prevValue = this.contact.notes
      })
    }
  },
  watch: {
    'contact.id': function () {
      this.isEdit = false
    }
  }
}
</script>
