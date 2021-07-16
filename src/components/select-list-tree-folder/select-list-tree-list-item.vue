<template>
    <div :class="{ 'list--active' : id === selectedStaticList.id }"
        :data-layer="layer"
         v-on:click="onSelect">
      <div
        :title="name"
        class="folder d-flex align-items-center"
      >
        <div class="folder__indent" :style="indentStyle"></div>
        <div class="folder__icon">
          <folder-static-icon
            v-if="type === ContactListTypes.STATIC"
          ></folder-static-icon>
          <folder-dynamic-icon
            v-if="type === ContactListTypes.DYNAMIC"
          ></folder-dynamic-icon>
        </div>
        <div class="folder__name">
          <span>
            {{ name }}
          </span>
        </div>
      </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import FolderStaticIcon from 'components/icons/folder-static-icon.vue'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon.vue'

let inputTimeout

export default {
  components: {
    FolderStaticIcon,
    FolderDynamicIcon

  },
  computed: {
    ...mapGetters('contacts', ['selectedStaticList']),
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
    },
    hasEdit: {
      type: Number
    },
    hasDelete: {
      type: Number
    }
  },
  data () {
    return {
      ContactListTypes
    }
  },
  beforeDestroy () {
    clearTimeout(inputTimeout)
  },
  methods: {
    ...mapActions('contacts', [
      'foldersLoaded',
      'listLoaded',
      'setSelectedStaticList'
    ]),
    onSelect () {
      this.setSelectedStaticList({ id: this.id, name: this.name, type: this.type, hasEdit: this.hasEdit, hasDelete: this.hasDelete })
    },
    reloadFolders () {
      return window.axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to load folders please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../css/mixins';
@import '../../css/variables';
.folder {
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
  &:hover,
  &--moving,
  &--active {
    background-color: $light-green2;
  }
  &__name {
    width: calc(100% - 54px);
    display: flex;
    align-items: center;
    span {
      display: inline-block;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  }
  &__sub {
    padding-left: 10px;
  }
  &__indent {
    width: 10px;
  }
  &__option {
    margin-top: -5px;
    margin-left: -5px;
  }
  &__input {
    font-size: 12px;
    height: 100%;
    width: 100%;
    border: none;
    border-radius: 0;
    &:focus {
      outline-color: $green;
      -moz-outline-radius: 0;
    }
  }
}

.list--active{
  background-color: #F2FBF6;
}
</style>
