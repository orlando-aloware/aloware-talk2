<template>
<div class="dialer-item">
  <avatar :src="avatar">
    {{ initial }}
  </avatar>
  <div class="dialer-item__contact">
    <div class="dialer-item__name">{{ name }}</div>
    <div class="dialer-item__number">{{ number }}</div>
  </div>
  <button class="dialer-item__btn">
    <answer-icon width="50" height="30"/>
  </button>
</div>
</template>

<script>
import Avatar from 'components/avatar/avatar'
import AnswerIcon from 'components/icons/answer-icon'
export default {
  name: 'dialer-item.vue',
  components: { AnswerIcon, Avatar },
  props: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    },
    initial: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.dialer-item {
  display: flex;
  align-items: center;
  border-bottom: solid 1px $grey-light3;
  height: 60px;
  cursor: pointer;

  &:hover {
    button {
      display: flex;
    }
  }

  &:last-child {
    border-bottom: none;
  }
  &__contact {
    padding-left: 10px;
    flex-grow: 1;
  }
  &__name {
    font-size: 13px;
    line-height: 18px;
    color: $black;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__number {
    color: $grey-dark;
    font-size: 12px;
    letter-spacing: 0;
    line-height: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__btn {
    width: 50px;
    height: 30px;
    padding: 0;
    background-color: $green;
    color: $white;
    border: 0;
    @include border-radius(30px);
    display: none;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: darken($green, 7%);
    }
  }
}

.dialer-item:hover svg circle {
  fill: darken($green, 7%);
}
</style>
