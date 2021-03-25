<template>
  <div class="message-header">
    <div class="message-header__close" @click="close">
      <chevron-right-icon></chevron-right-icon>
    </div>
    <div class="message-header__name">
      <div class="message-header__person">
        {{ name }}
      </div>
      <div class="message-header__meta">
        <span class="message-header__meta__status">{{ status }}</span>
        <span class="message-header__meta__time">{{ time }}</span>
        <span class="message-header__meta__rec">&#9899; Recording</span>
      </div>
    </div>
    <div class="message-header__actions">
      <button class="message-header__action message-header__decline" @click="decline">
        <pause-icon/>
      </button>
      <button class="message-header__action message-header__answer" @click="answer">
        <drop-icon/>
      </button>
      <button class="message-header__action message-header__info" @click="info">
        <info-icon/>
      </button>
    </div>
  </div>
</template>

<script>
import InfoIcon from 'components/icons/calls-sm/info-icon'
import PauseIcon from 'components/icons/pause-icon'
import DropIcon from 'components/icons/drop-icon'
import ChevronRightIcon from 'components/icons/chevron-right-icon'

export default {
  name: 'message-header.vue',
  components: { ChevronRightIcon, DropIcon, PauseIcon, InfoIcon },
  props: {
    name: {
      type: String,
      default: 'No Name'
    },
    status: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: '00:00'
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
      window.dispatchEvent(new CustomEvent('toggleContactInfo'))
    },
    close () {
      window.dispatchEvent(new CustomEvent('showMessage'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.message-header {
  display: flex;
  height: 68px;
  border-bottom: 1px solid $grey-light3;
  align-items: center;
  width: 100%;

  &__close {
    padding-left: 10px;
    padding-right: 10px;
    cursor: pointer;
  }

  &__name {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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
    display: none;

    @include screen('md') {
      display: flex;
    }
  }

  &__meta {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 16px;
    align-items: center;
    padding-top: 2px;
    display: none;

    @include screen('md') {
      display: flex;
    }

    &__status {
      color: $green;
      margin-right: 10px;
    }
    &__time {
      color: $black;
      margin-right: 30px;
    }
    &__rec {
      color: $red;
      margin-right: 10px;
    }
  }
}
</style>
