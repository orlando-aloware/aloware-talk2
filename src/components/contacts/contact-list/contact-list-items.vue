<template>
  <div class="contacts-list">
    <div v-for="item in items" :key="item.name" @click="() => setActive(item.name)">
      <contacts-list-item
        :name="item.name"
        :label="item.label"
        :count="item.count"
        :is-active="active === item.name"
        :icon="item.icon"
        :color="item.color"
      />
    </div>
  </div>
</template>

<script>
import ContactsListItem from './contact-list-item'

export default {
  name: 'contacts-list.vue',
  components: { ContactsListItem },
  methods: {
    setActive (nextActive) {
      this.active = nextActive
    }
  },
  data () {
    return {
      active: 'all',
      items: [
        {
          label: 'All',
          name: 'all',
          icon: 'list-all',
          count: '4,402',
          color: 'red'
        },
        {
          label: 'New Leads',
          name: 'new-leads',
          icon: 'list-new-lead',
          count: '1,600',
          color: 'orange'
        },
        {
          label: 'Unanswered Leads',
          name: 'unanswered-leads',
          icon: 'list-answer-lead',
          count: 11,
          color: 'red'
        },
        {
          label: 'Custom List',
          name: 'custom-list',
          icon: 'list-custom',
          count: 1000,
          color: 'grey-light3'
        },
        {
          label: 'High Maintenance',
          name: 'high-maintenance',
          icon: 'list-custom',
          count: 565,
          color: 'grey-light3'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contacts-list {
  display: flex;
  flex-direction: column;
}
</style>
