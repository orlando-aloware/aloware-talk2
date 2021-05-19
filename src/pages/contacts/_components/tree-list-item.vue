<template>
  <div :data-layer="layer">
    <div class="folder d-flex align-items-center">
      <div class="folder__indent" :style="indentStyle"></div>
      <div class="folder__icon">
        <folder-static-icon v-if="type === 'static'"></folder-static-icon>
        <folder-dynamic-icon v-if="type === 'dynamic'"></folder-dynamic-icon>
      </div>
      <div class="folder__name flex-grow-1" @click.prevent="onClickItem">
        {{ name }}
      </div>
      <b-popover
        :target="'folder-option-' + id + '-' + layer"
        triggers="click blur"
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover"
      >
        <list-actions
          :id="id"
          :type="type"
          @remove="onRemoveList"
        ></list-actions>
      </b-popover>
      <button
        :tabindex="id"
        :id="'folder-option-' + id + '-' + layer"
        class="folder__option btn btn-link p-0"
      >
        <folder-option></folder-option>
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import FolderOption from 'src/components/icons/folder-option.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import FolderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'
import ListActions from './list-actions.vue'

export default {
  components: {
    FolderOption,
    FolderStaticIcon,
    FolderDynamicIcon,
    ListActions
  },
  computed: {
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    }
  },
  props: {
    id: {
      type: Number
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: true
    },
    layer: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data () {
    return {}
  },
  methods: {
    ...mapActions('contacts', ['removeListOpen']),
    onClickItem () {
      this.$router.push(`/contacts/list/${this.id}`).catch((_err) => {})
    },
    onRemoveList () {
      this.removeListOpen({ id: this.id, name: this.name })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folder {
  padding-left: 10px;
  padding-right: 10px;
  line-height: 34px;
  cursor: pointer;
  user-select: none;
  transition: background-color 100ms ease-in-out;
  &__arrow {
    margin-top: -5px;
    margin-right: 5px;
  }
  &__icon {
    margin-top: -5px;
    margin-right: 5px;
  }
  &:hover {
    background-color: $light-green2;
  }
  &__name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sub {
    padding-left: 10px;
  }
  &__indent {
    width: 10px;
  }
  &__option {
    margin-top: -5px;
  }
}
</style>
