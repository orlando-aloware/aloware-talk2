<template>
  <q-chip outline
          dense
          :icon="icon"
          :key="name">
    <div class="ellipsis">
      {{ name }}
      <q-tooltip>{{ name }}</q-tooltip>
    </div>
  </q-chip>
</template>
<script>

export default {
  name: 'Tag',
  props: {
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: false,
      default: 'primary'
    },
    icon: {
      type: String,
      required: false,
      default: 'bookmark'
    }
  }
}
</script>
