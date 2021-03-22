<template>
  <div class="message">
    <div class="message__top">
      <message-header name="May Kerr" status="live call" time="0:00"></message-header>
    </div>
    <div class="message__main">
      <div class="message__main__list">
        <div class="message__main__marker">
          <message-marker text="Yesterday"/>
        </div>
        <div class="message__main__item message__main__item--right">
          <message-chat-bubble color="green" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
        </div>
        <div class="message__main__item message__main__item--right">
          <message-chat-bubble color="green" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
        </div>
        <div class="message__main__item message__main__item--left">
          <message-chat-bubble color="green" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
        </div>
        <div class="message__main__item message__main__item--left">
          <message-chat-bubble color="grey" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."/>
        </div>
        <div class="message__main__item message__main__item--left">
          <message-chat-bubble color="white" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."/>
        </div>
        <div class="message__main__marker">
          <message-marker text="Today"/>
        </div>
        <div class="message__main__item message__main__item--right">
          <message-chat-bubble color="green" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
        </div>
        <div class="message__main__item message__main__item--right">
          <message-chat-bubble color="green" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
        </div>
        <div class="message__main__item message__main__item--right">
          <message-chat-bubble color="green" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
        </div>
        <div class="message__main__item message__main__item--left">
          <message-chat-bubble color="grey" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."/>
        </div>
        <div class="message__main__item message__main__item--left">
          <message-chat-bubble color="white" time="10:40 PM"
                               body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."/>
        </div>
      </div>
    </div>
    <div class="message__box">
      <div class="message__box__inner">
        <div class="message__box__dropdown">
          Send messages from this line: <span>Aloware Main</span>
        </div>
        <message-box></message-box>
      </div>
    </div>
  </div>
</template>

<script>
import MessageHeader from 'components/inbox/message/message-header'
import MessageBox from 'components/inbox/message/message-box'
import MessageMarker from 'components/inbox/message/message-marker'
import MessageChatBubble from 'components/inbox/message/message-chat-bubble'

export default {
  name: 'message.vue',
  components: { MessageChatBubble, MessageBox, MessageHeader, MessageMarker },
  methods: {
    toggle () {
      this.$emit('toggle')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.message {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;

  &__top {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__main {
    width: 100%;
    height: calc(100% - 90px);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-grow: 1;
    align-items: flex-start;
    justify-content: flex-start;

    &__list {
      width: 100%;
      height: 100%;
      padding: 20px 20px 90px 20px;
    }

    &__marker {
      margin-bottom: 20px;
    }

    &__item {
      margin-bottom: 20px;
      @include screen('md') {
        &--left {
          padding-right: 25%;
        }
        &--right {
          padding-left: 25%;
        }
      }
      @include screen('lg') {
        &--left {
          padding-right: 40%;
        }
        &--right {
          padding-left: 40%;
        }
      }

      &:last-child {
        padding-bottom: 20px;
      }
    }
  }

  &__box {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
    min-height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;

    &__inner {
      flex-grow: 1;
      padding-left: 14px;
      padding-right: 14px;
    }

    &__dropdown {
      color: $grey-mid;
      font-size: 12px;
      letter-spacing: 0;
      line-height: 16px;
      padding-bottom: 5px;

      span {
        font-weight: bold;
        color: $black;
      }
    }
  }
}
</style>
