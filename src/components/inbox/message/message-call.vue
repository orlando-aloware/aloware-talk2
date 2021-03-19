<template>
  <div class="message-call">
    <div class="message-call__icon">
      <missed-call-red v-if="color === 'red'"></missed-call-red>
      <missed-call-green v-if="color === 'green'"></missed-call-green>
    </div>
    <div class="message-call__text">
      <div class="message-call__msg" :class="'message-call__msg--'+textColor">{{ text }}</div>
      <div v-if="!!time" class="message-call__time">{{ time }}</div>
    </div>
  </div>
</template>

<script>
import MissedCallRed from 'components/icons/missed-call-icon-red'
import MissedCallGreen from 'components/icons/missed-call-icon-green'

export default {
  name: 'message-missed-call.vue',
  components: { MissedCallGreen, MissedCallRed },
  props: {
    color: {
      type: String,
      required: true
    },
    textColor: {
      type: String
    },
    text: {
      type: String,
      required: true
    },
    time: {
      type: String
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.message-call {
  display: flex;
  align-items: center;
  font-size: 13px;

  &__icon {
    padding-right: 5px;
  }

  &__time {
    padding-left: 20px;
  }

  &__text {
    display: flex;
    align-items: center;
  }

  &__msg {
    flex-grow: 1;
    &--red {
      color: $red;
    }
    &--green {
      color: $green;
    }
    &--black {
      color: $black;
    }
  }
}
</style>
