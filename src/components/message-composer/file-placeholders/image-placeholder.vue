<template>
  <div>
    <img  class="img-preview"
          data-testid="image-placeholder-preview"
          :src="getFilePreview(file)"/>
    <b-button size="sm"
              class="btn-remove-file text-white"
              data-testid="image-placeholder-remove-button"
              @click="onRemove"
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
  name: 'image-placeholder',

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
