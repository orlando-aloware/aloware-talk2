<template>
  <b-card class="bg-transparent border-0 text-center">
    <div class="t-grouped-buttons pr-1">
      <div
        v-for="(filter, key) in tabs"
        :key="key"
        class="link px-1" style="display:contents;">
        <div
          @click="clicked(filter)"
          :class="`t-grouped-buttons__btn ml-1 ${id === filter.id ? 'active' : ''}`">
          <div class="t-badge-name">
            {{ filter.name }}
          </div>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'SessionFilters',
  props: {
    tabs: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    clicked (val) {
      this.id = val.id
      this.$emit('selected-tab', val)
    }
  },
  data () {
    return {
      id: 1
    }
  }
}
</script>
