<template>
  <div class="message-box" :class="{'message-box--focused': focused}">
    <div class="message-box__input">
      <input type="text" :placeholder="placeholder" @focus="handleFocus" @blur="handleBlur"/>
    </div>

    <input type="file" ref="attachment" class="message-box__file" @change="handleFileChanged"/>

    <button class="message-box__action" ref="actionbtn" @click="toggleAction">
      <setting-icon icon-color="grey-mid"/>
    </button>

    <button class="message-box__btn">
      <send-icon/>
    </button>
    <portal to="app">
      <div ref="actiondropdown" class="message-actions"
           :class="{
            'message-actions--show animate__animated animate__fadeIn': actionShowing,
            'animate__animated animate__fadeOut': !actionShowing}">
        <a class="message-actions__item">
          <div class="message-actions__item__icon">
            <attach-icon></attach-icon>
          </div>
          <div class="message-actions__item__label">
            Templates
          </div>
        </a>
        <a class="message-actions__item">
          <div class="message-actions__item__icon">
            <attach-icon></attach-icon>
          </div>
          <div class="message-actions__item__label">
            Send Media File
          </div>
        </a>
        <a class="message-actions__item">
          <div class="message-actions__item__icon">
            <attach-icon></attach-icon>
          </div>
          <div class="message-actions__item__label">
            Send GIF
          </div>
        </a>
        <a class="message-actions__item">
          <div class="message-actions__item__icon">
            <attach-icon></attach-icon>
          </div>
          <div class="message-actions__item__label">
            Send Fax
          </div>
        </a>
      </div>
    </portal>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'

import SendIcon from 'components/icons/send-icon'
import SettingIcon from 'components/icons/setting-icon'
import AttachIcon from 'components/icons/attach-icon'

let actionPopper

export default {
  name: 'message-box.vue',
  components: { AttachIcon, SettingIcon, SendIcon },
  data () {
    return {
      focused: false,
      actionShowing: false
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.createActionPopper()
    })
  },
  methods: {
    createActionPopper () {
      actionPopper = createPopper(this.$refs['actionbtn'], this.$refs['actiondropdown'], {
        placement: 'top-end'
      })
    },
    toggleAction () {
      this.actionShowing = !this.actionShowing
      console.log(this.actionShowing)
      actionPopper.forceUpdate()
    },
    handleFocus () {
      this.focused = true
    },
    handleBlur () {
      this.focused = false
    },
    attach () {
      this.$refs.attachment.click()
    },
    handleFileChanged (evt) {
      const files = evt.target.files
      if (files.length) {
        this.$emit('attach', files[0])
      }
    }
  },
  props: {
    placeholder: {
      type: String,
      default: 'Message here...'
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.message-actions {
  min-width: 200px;
  min-height: 100px;
  max-height: 200px;
  background-color: $white;
  box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  visibility: hidden;
  border: solid 1px $grey-light3;
  @include border-radius(10px);
  z-index: -1;
  position: absolute;

  &--show {
    visibility: visible;
    z-index: 3 !important;
  }

  &__item {
    display: flex;
    height: 40px;
    align-items: center;
    text-decoration: none;
    border-bottom: solid 1px $grey-light;
    cursor: pointer;
    transition: background-color 100ms ease-in;
    &:hover {
      background-color: $grey-light2;
    }

    &__icon {
      padding-right: 5px;
      padding-left: 10px;
    }
    &__label {
      font-size: 12px;
      color: $black;
      flex-grow: 1;
    }
  }
}

.message-box {
  display: flex;
  height: 42px;
  width: 100%;
  align-items: center;
  border: solid 2px $grey-light7;
  @include border-radius(8px);
  position: relative;

  &--focused {
    border-color: $green;
  }

  &__file {
    position: absolute;
    left: -3000px;
    right: -3000px;
  }

  &__action {
    background-color: $white;
    border: 0;
    height: 38px;
    width: 41.85px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 100ms ease-in;

    &:hover {
      background-color: darken($white, 7%);
    }
  }

  &__btn {
    background-color: $green;
    border: 0;
    height: 38px;
    width: 41.85px;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 100ms ease-in;

    &:hover {
      background-color: darken($green, 7%);
    }
  }

  &__input {
    flex-grow: 1;
    padding-left: 18px;

    input {
      height: 38px;
      border: 0;
      color: $black;
      font-size: 12px;
      padding: 0;
      margin: 0;
      width: 100%;
      outline: none;

      &::placeholder {
        color: $grey-mid;
      }
    }
  }
}
</style>
