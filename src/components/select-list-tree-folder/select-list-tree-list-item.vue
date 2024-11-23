<template>
    <div :class="{ 'list--active' : id === selectedStaticList.id }"
        :data-layer="layer"
         @click="onSelect">
      <div
        :title="name"
        class="folder d-flex align-items-center"
      >
        <div class="folder__indent" :style="indentStyle"></div>
        <div class="folder__icon">
          <contact-list-type-icon testIdSuffix='list-tree'
                                  :type="type" />
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
import ContactListTypeIcon from 'components/contacts/contact-list-type-icon.vue'

export default {
  components: {
    ContactListTypeIcon
  },
  computed: {
    ...mapGetters('contacts', ['selectedStaticList']),
    indentStyle () {
      return {
        flex: `0 0 ${this.layer * 10}px`,
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
      ContactListTypes,
      inputTimeout: null
    }
  },
  beforeDestroy () {
    clearTimeout(this.inputTimeout)
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
      return this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  }
}
</script>
