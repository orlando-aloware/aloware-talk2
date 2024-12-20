<template>
  <div class="d-flex justify-content-center context-menu">
    <b-dropdown no-caret
                size="sm"
                container="body"
                center>
      <template #button-content>
        <ellipse-icon />
      </template>
      <b-dropdown-item dense
                       clickable>
        Edit
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import EllipseIcon from 'components/icons/ellipse-icon'

export default {
  name: 'CommunicationsOperations',
  components: {
    EllipseIcon

  },
  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
