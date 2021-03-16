<template>
<div class="calls-list-item">
  <div class="calls-list-item__avatar">
    <avatar :src="avatar">
      {{initial}}
    </avatar>
  </div>
  <div class="calls-list-item__content">
    <div class="calls-list-item__name">{{ name }}</div>
    <div class="calls-list-item__number">{{ number }}</div>
  </div>
  <div class="calls-list-item__time">
    {{ time }}
  </div>
  <div class="calls-list-item__actions">
    <a href="#" class="calls-list-item__actions__item" @click.prevent="decline">
      <decline-icon />
    </a>
    <a href="#" class="calls-list-item__actions__item" @click.prevent="answer">
      <answer-icon />
    </a>
  </div>
</div>
</template>

<script>
import DeclineIcon from 'components/icons/decline-icon'
import AnswerIcon from 'components/icons/answer-icon'
import Avatar from 'components/avatar/avatar'

export default {
  name: 'calls-list-item.vue',
  components: { Avatar, AnswerIcon, DeclineIcon },
  methods: {
    decline () {
      this.$emit('decline')
    },
    answer () {
      this.$emit('answer')
    }
  },
  props: {
    initial: {
      type: String,
      default: 'NN'
    },
    name: {
      type: String,
      default: 'No Name'
    },
    number: {
      type: String,
      default: 'unknown number'
    },
    time: {
      type: String,
      default: '00:00'
    },
    avatar: {
      type: String,
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.calls-list-item {
  display: flex;
  height: 60px;
  background-color: $white;
  align-items: center;
  cursor: pointer;
  border-bottom: solid 1px $grey-light3;
  &:hover {
    background-color: $light-green;
  }
  &__avatar {
    padding-left: 20px;
  }
  &__content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-left: 10px;
    padding-right: 20px;
  }
  &__name {
    font-size: 14px;
    font-weight: bold;
    color: $black;
  }
  &__number {
    font-size: 12px;
    color: $grey-mid;
  }
  &__time {
    font-size: 12px;
    color: $black;
    width: 24px;
  }
  &__actions {
    padding-left: 15px;
    padding-right: 20px;
    display: flex;
    &__item {
      :first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
