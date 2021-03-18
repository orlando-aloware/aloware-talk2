<template>
  <div class="message-header">
    <div class="message-header__name">
      <div class="message-header__person">
        {{ name }}
      </div>
      <div class="message-header__number">
        {{ status }}
      </div>
    </div>
    <div class="message-header__actions">
      <button class="message-header__action message-header__decline" @click="decline">
        <decline-icon/>
      </button>
      <button class="message-header__action message-header__answer" @click="answer">
        <answer-icon/>
      </button>
      <button class="message-header__action message-header__info" @click="info">
        <info-icon/>
      </button>
    </div>
  </div>
</template>

<script>
import DeclineIcon from 'components/icons/decline-icon'
import AnswerIcon from 'components/icons/answer-icon'
import InfoIcon from 'components/icons/calls-sm/info-icon'

export default {
  name: 'message-header.vue',
  components: { InfoIcon, AnswerIcon, DeclineIcon },
  props: {
    name: {
      type: String,
      default: 'No Name'
    },
    status: {
      type: String,
      default: ''
    }
  },
  methods: {
    decline () {
      this.$emit('decline')
    },
    answer () {
      this.$emit('answer')
    },
    info () {
      this.$emit('info')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.message-header {
  display: flex;
  height: 68px;
  border-bottom: 1px solid $grey-light3;
  align-items: center;

  &__name {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-left: 20px;
  }

  &__actions {
    display: flex;
    flex-direction: row;
  }

  &__action {
    padding: 0;
    border: 0;
    background-color: transparent;
    display: flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
  }

  &__decline {
    margin-right: 10px;
  }

  &__answer {
    margin-right: 20px;
  }

  &__info {
    margin-right: 10px;
  }

  &__person {
    color: $black;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 0.4px;
    line-height: 21px;
  }

  &__number {
    color: $red;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 16px;
  }
}
</style>
