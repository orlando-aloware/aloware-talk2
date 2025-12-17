<template>
  <pencil-o-icon
    :color="iconColor"
    :height="String(size)"
    :width="String(size)"
  />
</template>

<script>
import PencilOIcon from 'src/components/icons/pencil-o-icon'

export default {
  name: 'contact-info-edit-icon',
  components: {
    PencilOIcon
  },
  props: {
    size: {
      type: [String, Number],
      default: 18
    }
  },
  computed: {
    iconColor () {
      // Use Quasar's primary color from CSS variable
      return 'var(--q-color-primary)'
    }
  }
}
</script>
