<template>
  <div class="message-box" :class="{'message-box--focused': focused}">
    <div class="message-box__input">
      <input type="text" :placeholder="placeholder" @focus="handleFocus" @blur="handleBlur"/>
    </div>
    <input type="file" ref="attachment" class="message-box__file" @change="handleFileChanged"/>
    <button class="message-box__attach" @click="attach">
      <attach-icon/>
    </button>
    <button class="message-box__btn">
      <send-icon/>
    </button>
  </div>
</template>

<script>
import SendIcon from 'components/icons/send-icon'
import AttachIcon from 'components/icons/attach-icon'

export default {
  name: 'message-box.vue',
  components: { AttachIcon, SendIcon },
  data () {
    return {
      focused: false
    }
  },
  methods: {
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

.message-box {
  display: flex;
  height: 42px;
  align-items: center;
  border: solid 2px $grey-light5;
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

  &__attach {
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
