<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6 ref="sample">Notes</h6>
    <div v-if="!is_edit"
         class="notes" v-on:click="onEditNotes">
      {{ contact.notes }}
    </div>
    <div v-if="(!contact.notes || contact.notes.length < 1) && !is_edit"
         class="notes-empty-placeholder" v-on:click="onEditNotes">Add notes here..</div>
    <div v-if="is_edit"
         style="max-width: 300px" v-on:blur="onBlur">
      <q-input
        ref="notesInput"
        outlined
        autogrow
        debounce="500"
        v-model="contact.notes"
        v-on:blur="onBlur"
      />
    </div>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-notes',
  computed: {
    ...mapGetters('contacts', ['contact']),
    notes () {
      return this.contact.notes
    }
  },
  data () {
    return {
      is_edit: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    onEditNotes () {
      this.is_edit = true
      this.$nextTick(function () {
        this.$refs.notesInput.focus()
      })
    },
    onBlur () {
      this.is_edit = false
    },
    onUpdate () {
      talk2Api.V1.contact.update(this.contact.id, { notes: this.contact.notes }).then(response => {
        this.setContact(response.data)
      })
    }
  },
  watch: {
    notes: function () {
      this.onUpdate()
    }
  },
  mounted () {
    this.is_edit = false
  }
}
</script>

<style lang="scss" scoped>
  .notes{
    font-size: 80%;
  }

  .contact-notes {
    border: none;
    opacity: 0.5;
  }
  .contact-notes:hover {
    border: 1px solid #256EFF;
  }

  .notes-empty-placeholder {
    font-size: 80%;
    opacity: 0.5;
  }
</style>
