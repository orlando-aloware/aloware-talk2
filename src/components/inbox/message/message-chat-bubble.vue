<template>
  <div>
    <div class="message-chat-bubble" :class="{
    'message-chat-bubble--grey': color === 'grey',
    'message-chat-bubble--white': color === 'white',
    'message-chat-bubble--green': color === 'green'
  }">
      <div class="message-chat-bubble__text">
        {{ body }}
      </div>
      <div class="message-chat-bubble__meta">
        <div class="message-chat-bubble__action">
          <slot />
        </div>
        <div class="message-chat-bubble__time" :class="{
          'message-chat-bubble__time--grey': color === 'grey',
          'message-chat-bubble__time--white': color === 'white',
          'message-chat-bubble__time--green': color === 'green'
          }">{{ time }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'message-chat-bubble.vue',
  props: {
    color: {
      type: String,
      validator: (val) => ['grey', 'white', 'green'].includes(val)
    },
    body: {
      type: String
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

.message-chat-bubble {
  border-radius: 8px;
  border: solid 2px transparent;
  padding: 12px;
  display: flex;
  flex-direction: column;
  color: $black;
  margin-bottom: 10px;
  position: relative;

  &__time {
    font-size: 11px;
    line-height: 15px;
    text-align: right;

    &--green {
      color: $green;
    }

    &--grey {
      color: $grey-mid;
    }

    &--white {
      color: $grey-mid;
    }
  }

  &__action {
    flex-grow: 1;
  }

  &__meta {
    display: flex;
    align-items: center;
  }

  &__text {
    font-size: 13px;
    line-height: 18px;
  }

  &__arrow1 {
    width: 0;
    height: 0;
    border-left: 0px solid transparent;
    border-right: 12px solid transparent;
    border-top: 12px solid $light-green3;
    position: absolute;
    bottom: -12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &--green {
    border-color: $light-green3;
    background-color: $light-green2;
  }

  &--grey {
    border-color: $grey-light7;
    background-color: $grey-light6;
  }

  &--white {
    border-color: $grey-light7;
    background-color: $white;
  }
}
</style>
