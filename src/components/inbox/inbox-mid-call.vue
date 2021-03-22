<template>
  <div class="inbox-mid-call">
    <div class="inbox-mid-call__top">
      <div class="inbox-mid-call__top__view">
        <div @click="toggle">
          <task-view-btn/>
        </div>
      </div>
      <div @click="toggleContactInfo">
        <task-info-btn/>
      </div>
    </div>
    <div class="inbox-mid-call__main">
      <div class="inbox-mid-call__content">
        <task-avatar src="https://uifaces.co/our-content/donated/3799Ffxy.jpeg" animated>MK</task-avatar>
        <div class="inbox-mid-call__contact">
          <task-contact name="May Kerr" number="(111) 222-3333"></task-contact>
        </div>
        <div class="inbox-mid-call__actions">
          <task-actions/>
        </div>
        <div class="inbox-mid-call__buttons">
          <task-drop-btn/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskViewBtn from 'components/inbox/task/task-view-btn'
import TaskInfoBtn from 'components/inbox/task/task-info-btn'
import TaskAvatar from 'components/inbox/task/task-avatar'
import TaskContact from 'components/inbox/task/task-contact'
import TaskActions from 'components/inbox/task/task-actions'
import TaskDropBtn from 'components/inbox/task/task-drop-btn'

export default {
  name: 'inbox-mid-call.vue',
  components: { TaskDropBtn, TaskActions, TaskContact, TaskAvatar, TaskInfoBtn, TaskViewBtn },
  methods: {
    toggle () {
      this.$emit('toggle')
    },
    toggleContactInfo () {
      window.dispatchEvent(new CustomEvent('toggleContactInfo'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-mid-call {
  padding: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  background: linear-gradient(180deg, $white 80%, $flesh 100%);

  &__top {
    display: flex;
    align-items: center;

    &__view {
      flex-grow: 1;
    }
  }

  &__main {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  &__contact {
    padding-top: 10px;
  }

  &__actions {
    padding-top: 25px;
  }

  &__buttons {
    padding-top: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
