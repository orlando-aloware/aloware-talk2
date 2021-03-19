<template>
  <div class="contacts-list-item" :class="{'contacts-list-item--active': isActive}">
    <div class="contacts-list-item__icon">
      <component v-bind:is="icon + '-icon'" :iconColor="isActive ? 'green' : 'grey-mid'"></component>
    </div>
    <div class="contacts-list-item__label" :class="{'contacts-list-item__label--active': isActive}">
      {{ label }}
    </div>
    <div class="contacts-list-item__badge">
      <contact-list-badge :value="count" :color="color"/>
    </div>
  </div>
</template>

<script>
import DeleteIcon from 'components/icons/contacts/delete-icon'
import ListAllIcon from 'components/icons/contacts/list-all-icon'
import ListAnswerLeadIcon from 'components/icons/contacts/list-answer-lead-icon'
import ListCustomIcon from 'components/icons/contacts/list-custom-icon'
import ListNewLeadIcon from 'components/icons/contacts/list-new-lead-icon'
import MoreOptionsIcon from 'components/icons/contacts/more-options-icon'
import RefreshIcon from 'components/icons/contacts/refresh-icon'
import ContactListBadge from 'components/contacts/contact-list/contact-list-badge'

export default {
  name: 'contacts-list-item.vue',
  props: {
    icon: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    count: {
      type: [String, Number],
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  components: {
    ContactListBadge,
    RefreshIcon,
    MoreOptionsIcon,
    ListNewLeadIcon,
    ListCustomIcon,
    ListAnswerLeadIcon,
    ListAllIcon,
    DeleteIcon
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contacts-list-item {
  min-height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 100ms ease-in;

  &--active {
    background-color: $flesh !important;
  }

  &:hover {
    background-color: $grey-light2;
  }

  &__icon {
    padding-left: 20px;
    display: flex;
    height: 24px;
  }

  &__badge {
    padding-right: 20px;
  }

  &__label {
    padding-left: 10px;
    color: $grey-dark;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 19px;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;

    &--active {
      color: $black;
    }
  }
}
</style>
