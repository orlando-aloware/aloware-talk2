<template>
  <div>
    <div class="align-items-center"
         v-if="!isEditingNote">
      <div class="notes mt-1"
           v-html="communication.notes"/>
      <a href="#"
         class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
         @click.prevent="onEditNote(true)">
        <slot name="button">
          <span>
            {{ buttonLabel }}
          </span>
        </slot>
      </a>
    </div>
    <div class="d-flex align-items-center"
         v-if="isEditingNote">
      <communication-note ref="communicationNote"
                          :auto-focus="true"
                          :communication="communication"
                          @notesBlurred="onEditNote(false)">
      </communication-note>
    </div>
  </div>
</template>

<script>
import CommunicationNote from 'src/components/communication-note.vue'

export default {
  name: 'wallboard-calls-note',

  components: {
    CommunicationNote
  },

  props: {
    communication: {
      type: Object,
      required: true
    }
  },

  computed: {
    buttonLabel () {
      return (this.communication.notes?.trim().length ? 'Edit' : 'Add') + ' Note'
    }
  },

  data: () => ({
    isEditingNote: false
  }),

  methods: {
    onEditNote (state) {
      this.isEditingNote = state
    }
  }
}
</script>
