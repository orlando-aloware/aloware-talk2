<template>
  <label class="custom-checkbox-container">
    <input
      type="checkbox"
      class="checker"
      :value="resource.id"
      :checked="checkedItems.find(item => item.id === resource.id)" />
    <span class="checkmark"></span>
  </label>
</template>

<script>
export default {
  name: 'CheckboxInteractive',
  props: {
    resource: {
      type: Object,
      default: () => {}
    },
    checkedItems: {
      type: Array,
      default: () => []
    }
  }
}
</script>
