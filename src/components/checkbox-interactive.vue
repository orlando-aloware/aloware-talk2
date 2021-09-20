<template>
  <label class="custom-checkbox-container">
    <input
      type="checkbox"
      class="checker"
      :value="resource.id"
      :checked="isChecked"
      @change="onCheckerClicked" />
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
  },
  data () {
    return {
      isChecked: false
    }
  },
  methods: {
    onCheckerClicked () {
      let items = []
      let found = this.checkedItems.find(item => item.id === this.resource.id)
      console.log('found : ', found)
      if (found) {
        items = this.checkedItems.filter(item => item.id !== this.resource.id)
      } else {
        items = [...this.checkedItems]
        items.push(this.resource)
      }
      this.$emit('checked', items)
    }
  }
}
</script>
