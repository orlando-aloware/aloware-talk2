<template>
  <div>
    <b-embed type="video"
             aspect="1by1">
      <source :src="getFilePreview(file)"
              :type="file.type">
    </b-embed>
    <b-button size="sm"
              variant="light"
              class="btn-play"
              pill>
      <i class="fa fa-play"></i>
    </b-button>
    <b-button size="sm"
              class="btn-remove-file"
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
  name: 'video-placeholder',

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
