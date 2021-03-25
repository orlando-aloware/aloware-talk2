<template>
  <div class="calls-list-item" :class="{'calls-list-item--active': active}">
    <div class="calls-list-item__avatar">
      <avatar :src="avatar" :active="active">
        {{ initial }}
      </avatar>
    </div>
    <div class="calls-list-item__content">
      <div class="calls-list-item__name">{{ name }}</div>
      <div class="calls-list-item__number">{{ number }}</div>
    </div>
    <div class="calls-list-item__time">
      {{ time }}
    </div>
    <div v-if="active" class="calls-list-item__actions">
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__decline" @click.prevent="decline">
        <pause-icon />
      </a>
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__answer" @click.prevent="answer">
        <drop-icon/>
      </a>
    </div>
    <div v-if="!active" class="calls-list-item__actions">
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__decline" @click.prevent="decline">
        <decline-icon/>
      </a>
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__answer" @click.prevent="answer">
        <answer-icon/>
      </a>
    </div>
  </div>
</template>

<script>
import DeclineIcon from 'components/icons/decline-icon'
import AnswerIcon from 'components/icons/answer-icon'
import Avatar from 'components/avatar/avatar'
import PauseIcon from 'components/icons/pause-icon'
import DropIcon from 'components/icons/drop-icon'

export default {
  name: 'calls-list-item.vue',
  components: { DropIcon, PauseIcon, Avatar, AnswerIcon, DeclineIcon },
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
      required: true
    },
    number: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: '00:00'
    },
    avatar: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.calls-list-item {
  display: flex;
  height: 60px;
  background-color: $white;
  align-items: center;
  border-bottom: solid 1px $grey-light3;
  transition: background-color 100ms ease-in;

  &--active {
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
    overflow: hidden;
    width: 100px;
  }

  &__name {
    font-size: 13px;
    font-weight: bold;
    color: $black;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__number {
    font-size: 13px;
    color: $grey-mid;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__time {
    font-size: 12px;
    color: $black;
    width: 46px;
    text-align: right;
  }

  &__actions {
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    width: 112px;
    text-align: right;
    justify-content: flex-end;

    &__item {
      :first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
