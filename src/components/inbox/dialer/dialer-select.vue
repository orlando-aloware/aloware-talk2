<template>
  <div class="dialer-select">
    <div class="dialer-select__label">
      Call using:
    </div>
    <div class="dialer-select__value">
      <span class="dialer-select__item" @click="toggle">Aloware Main (000) 123-4567</span>
      <div class="dialer-select__icon" ref="show" @click="toggle"><i class="gg-chevron-down"></i></div>
    </div>
    <div ref="drop"
         class="dialer-select__dropdown"
         :class="{'dialer-select__dropdown--show animate__animated animate__fadeIn': showing, 'animate__animated animate__fadeOut': !showing}">
      <div class="dialer-select__dropdown__search">
        <input type="text" class="form-control search-control" placeholder="Search...">
      </div>
      <div class="dialer-select__dropdown__items" @click="toggle">
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
        <div class="dialer-select__dropdown__item">
          Aloware Main (000) 123-4567
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'

let popper

export default {
  name: 'dialer-select.vue',
  data () {
    return {
      showing: false
    }
  },
  methods: {
    toggle () {
      this.showing = !this.showing
      console.log(this.showing)
      popper.forceUpdate()
    }
  },
  mounted () {
    this.$nextTick(() => {
      popper = createPopper(this.$refs['show'], this.$refs['drop'], {
        placement: 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [10, 15]
            }
          }
        ]
      })
    })
  },
  beforeDestroy () {
    if (popper && typeof popper.destroy === 'function') {
      popper.destroy()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.gg-chevron-down {
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 5px;
  height: 5px;
  border: 1px solid transparent;
  border-radius: 100px
}

.gg-chevron-down::after {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 5px;
  height: 5px;
  border-bottom: 1px solid;
  border-right: 1px solid;
  transform: rotate(45deg);
  left: 4px;
  top: 2px
}

.search-control {
  &:focus {
    border-color: $green;
    box-shadow: 0 0 0 0.2rem lighten($light-green, 75%);
  }
}

.dialer-select {
  display: flex;
  flex-direction: column;

  &__dropdown {
    width: 102%;
    min-height: 100px;
    max-height: 200px;
    background-color: $white;
    position: absolute;
    box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
    display: block;
    visibility: hidden;
    overflow: hidden;
    border: solid 1px $grey-light3;
    @include border-radius(10px);

    &__items {
      padding-left: 10px;
      padding-right: 10px;
      padding-bottom: 30px;
      display: flex;
      align-items: center;
      flex-direction: column;
      overflow-y: auto;
      max-height: calc(200px - 30px);
    }

    &__item {
      min-height: 40px;
      font-size: 12px;
      width: 100%;
      border-top: solid 1px $grey-light3;
      display: flex;
      align-items: center;
      color: $black;
      cursor: pointer;
      padding-left: 10px;
      padding-right: 10px;
      transition: background-color 100ms ease-in;

      &:hover {
        background-color: $grey-light2;
      }
    }

    &__search {
      padding: 10px;
    }

    &--show {
      visibility: visible;
    }
  }

  &__label {
    font-size: 12px;
    color: $grey-light7;
    line-height: 16px;
    opacity: 0.9;
  }

  &__value {
    font-size: 13px;
    font-weight: bold;
    line-height: 18px;
    padding-right: 5px;
    display: flex;
    align-items: center;
    cursor: pointer;
    opacity: 0.9;
    position: relative;
  }

  &__item {
    margin-right: 5px;
  }

  &__icon {
    margin-top: -10px;
  }
}
</style>
