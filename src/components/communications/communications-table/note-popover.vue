<template>
  <div class="text-center ">
    <q-icon :id="`note-${_uid}`"
            :name="iconName"
            :color="iconColor"
            style="font-size: 1.5rem;"
    />
    <b-popover v-if="note" triggers="hover"
               :target="`note-${_uid}`" >
          <div class="font-weight-bolder">{{ note }}</div>
    </b-popover>
  </div>
</template>

<script>
export default {
  name: 'NotePopover',
  props: {
    note: {
      type: String,
      required: false,
      default: null
    }
  },
  data () {
    return {
      showPopover: false
    }
  },
  computed: {
    iconName () {
      return 'o_description'
    },
    iconColor () {
      return this.note ? 'primary' : 'grey-4'
    }
  }
}
</script>

<style scoped>
.text-h6 {
  font-weight: bold;
}
.note-icon-container {
  display: inline-block;
  position: relative;
}
</style>
