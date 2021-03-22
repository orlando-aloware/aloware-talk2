<template>
  <div class="task-actions">
    <div class="task-actions__container">
      <div v-for="item in items" :key="item.label" @click="() => click(item)">
        <task-action  :label="item.label" :icon="item.icon" />
      </div>
    </div>
  </div>
</template>

<script>
import TaskAction from './task-action'

export default {
  name: 'task-actions.vue',
  components: {
    TaskAction
  },
  methods: {
    click (action) {
      this.$emit('action', action.label)
    }
  },
  data () {
    return {
      items: [
        {
          label: 'Add',
          icon: 'plus'
        },
        {
          label: 'Hold ',
          icon: 'hold'
        },
        {
          label: 'Transfer',
          icon: 'transfer'
        },
        {
          label: 'Notes',
          icon: 'note'
        },
        {
          label: 'Hold',
          icon: 'hold'
        },
        {
          label: 'Tag',
          icon: 'tag'
        },
        {
          label: 'Mute',
          icon: 'mute'
        },
        {
          label: 'VM Drop',
          icon: 'merge'
        },
        {
          label: 'Contact',
          icon: 'contact'
        },
        {
          label: 'Pause Rec',
          icon: 'pause'
        },
        {
          label: 'Dial Pad',
          icon: 'keypad'
        },
        {
          label: 'Speaker',
          icon: 'speaker'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/breakpoints.scss';
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.task-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  &__container {
    margin: auto;
    display: grid;
    grid-template-columns: 80px 80px 80px;
    grid-template-rows: 80px 80px 80px 80px;

    @include screen('lg') {
      grid-template-rows: 50px 50px;
      grid-template-columns: 80px 80px 80px 80px 80px 80px;
    }
  }
}
</style>
