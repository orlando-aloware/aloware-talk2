<template>
  <div data-testid="teaminbox-nav-item"
       :id="`teaminbox-nav-item-${_uid}`"
       :class="['teaminbox-nav-item', { 'teaminbox-nav-item--active': isActive }]"
       @click="$emit('click', value)">
    <div class="teaminbox-nav-item__content d-flex align-items-center">
      <span class="d-flex align-items-center mr-1">
        <inbox-icon width="18"
                    height="18" />
      </span>
      <span class="teaminbox-nav-item__label" :id="`teaminbox-nav-item-label-${_uid}`">{{ label }}</span>
      <div class="teaminbox-nav-item__unread-count-container"
           v-if="isLoadingUnreadCount || unreadCount > 0">
        <q-skeleton type="text"
                    width="20px"
                    v-if="isLoadingUnreadCount"/>
        <q-badge pill
                rounded
                v-else-if="unreadCount < 99">
          {{ unreadCount }}
        </q-badge>
        <q-badge pill
                 rounded
                 v-else>
          99<sup>+</sup>
        </q-badge>
      </div>
    </div>
    <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
        placement="right"
        :target="`teaminbox-nav-item-${_uid}`"
        boundary="window"
        :delay="500">
        {{ label }} - {{ unreadCount }} unread communications
    </b-tooltip>
  </div>
</template>

<script>
import InboxIcon from 'src/components/icons/inbox/inbox-icon.vue'

export default {
  props: {
    label: {
      type: String,
      required: true
    },

    value: {
      type: [String, Number],
      required: true
    },

    isLoadingUnreadCount: {
      type: Boolean,
      default: false
    },

    unreadCount: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },

  components: {
    InboxIcon
  }
}
</script>

<style lang="scss" scoped>
.teaminbox-nav-item {
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
  width: 100%;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: #E9F0FF;
  }

  &:has(&__unread-count-container) {
    padding-right: 35px;
  }

  &__label {
    font-size: 14px;
    max-width: calc(100vw - 75px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__content {
    width: 100%;
  }

  &__unread-count-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.3s ease-out;

    .q-badge {
      font-size: 10px;
      line-height: 11px;
      font-weight: bold;
      width: 21px;
      height: 21px;
      border-radius: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f44336;
    }
  }

  &--active {
    background-color: #E9F0FF;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 2px;
      background: linear-gradient(90deg, #7c3aed, #0ea5e9);
      -webkit-mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
      mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      clip-path: inset(0 round 8px);
      border-radius: 8px;
    }
  }

  @media(min-width: 785px) {
    max-width: 235px;

    &__label {
      max-width: 180px;
    }
  }
}
</style>
