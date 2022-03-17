<template>
  <label class="custom-checkbox-container">
    <input
      type="checkbox"
      class="checker"
      :value="resource.id"
      v-model="isChecked"
      :checked="checked"
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
  computed: {
    checked () {
      return this.checkedItems.find(item => item.id === this.resource.id)
    }
  },
  data () {
    return {
      isChecked: false
    }
  },
  methods: {
    onCheckerClicked () {
      const items = { data: [] }
      const found = this.checkedItems.find(item => item.id === this.resource.id)
      if (found) {
        items.data = this.checkedItems.filter(item => item.id !== this.resource.id)
      } else {
        items.data = [...this.checkedItems]
        items.data.push(this.resource)
      }
      this.$emit('checked', { data: items.data, checked: this.isChecked })
    }
  },
  watch: {
    checkedItems (arr) {
      const found = this.checkedItems.find(item => item.id === this.resource.id)
      if (found) {
        this.isChecked = true
      } else {
        this.isChecked = false
      }
    }
  }
}
</script>
