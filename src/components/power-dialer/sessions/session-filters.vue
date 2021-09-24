<template>
  <b-card class="bg-transparent border-0 text-center">
    <div class="t-grouped-buttons" style="display:inline-flex !important;">
      <div
        v-for="(filter, key) in list"
        :key="key"
        class="link px-1" style="display:contents;">
        <div
          @click="clicked(filter.id)"
          :class="`t-grouped-buttons__btn ${id === filter.id ? 'active' : ''}`">
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
    clicked (id) {
      this.id = id
    }
  },
  data () {
    return {
      id: 1,
      list: [
        {
          id: 1,
          name: 'Details'
        },
        {
          id: 2,
          name: 'Activity'
        },
        {
          id: 3,
          name: 'CRM View'
        }
      ]
    }
  }
}
</script>
