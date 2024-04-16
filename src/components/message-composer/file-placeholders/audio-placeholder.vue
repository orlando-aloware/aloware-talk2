<template>
  <div>
    <div class="text-center media-icon-wrapper mt-2">
      <i class="fa fa-microphone media-icon"></i>
    </div>
    <p class="ellipsis mt-1 text-center">{{ file.name }}</p>
    <b-button size="sm"
              class="btn-remove-file"
              data-testid="audio-placeholder-remove-button"
              @click="onRemove(file)"
              @mouseout="hovered = false"
              @mouseover="hovered = true"
              pill>

      <i v-if="hovered" class="fa fa-times"></i>
      <i v-else class="fas fa-circle-notch fa-spin"></i>
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'audio-placeholder',

  props: {
    file: {
      type: File,
      required: true
    }
  },

  data () {
    return {
      hovered: false
    }
  },

  methods: {
    getFilePreview (file) {
      return URL.createObjectURL(file)
    },
    onRemove () {
      this.$emit('remove', this.file)
    }
  }
}
</script>

<style scoped>

</style>
