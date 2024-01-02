<template>
  <div class="filter-items cursor-pointer d-flex justify-content-between position-relative"
       v-bind:class="{ 'active' : selectedFilter && selectedFilter.id === filter.id && !isRenaming }"
       @click="onItemSelect">
    <span v-if="!isRenaming">
      <q-tooltip anchor="top middle"
                 self="center middle">
        {{ filter.name }}
      </q-tooltip>
      {{ filter.name }}
    </span>
    <b-form-input size="sm"
                  :value="filter.name"
                  :id="'filter-input-' + filter.id"
                  v-if="isRenaming"
                  @blur="onInputBlur"
                  @keydown="onKeyDown">
    </b-form-input>
    <b-dropdown class="m-2 b-compact-dropdown-button text-bold position-absolute"
                no-caret
                :popper-opts="{ positionFixed: true }"
                variant="light"
                v-if="!isRenaming">
      <template #button-content>
        <i class="fa fa-ellipsis-h"></i>
      </template>
      <b-dropdown-item href="#"
                       @click="(e) => onEdit(e)">
        <pencil-icon></pencil-icon> Rename
      </b-dropdown-item>
      <b-dropdown-item href="#"
                       @click="(e) => onDelete(e)">
        <trash-o-icon></trash-o-icon> Delete
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PencilIcon from 'components/icons/pencil-icon'
import TrashOIcon from 'components/icons/trash-o-icon'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'filter-list-items',
  components: {
    TrashOIcon,
    PencilIcon
  },

  props: {
    filter: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters('inbox', ['selectedFilter'])
  },

  data () {
    return {
      isRenaming: false,
      isUpdating: false,
      inputTimeout: null
    }
  },

  methods: {
    updateFilter () {
      this.isUpdating = true
      return talk2Api.V2.inbox.filters.update(this.selectedFilter.id, { ...this.filterModel, name: this.selectedFilter.name, scope: this.selectedFilter.scope }).then(res => {
        this.setSelectedFilter(res.data.filter)
        this.isUpdating = false
      })
    },

    onItemSelect () {
      this.$emit('filterSelected', this.filter)
    },

    onDelete (e) {
      this.$emit('filterDelete', this.filter)
      e.stopImmediatePropagation()
    },

    onEdit (e) {
      this.isRenaming = true
      this.inputTimeout = setTimeout(() => {
        document.getElementById('filter-input-' + this.filter.id).focus()
      })

      e.stopPropagation()
    },

    onInputBlur (evt) {
      if (evt.target.value !== '') {
        this.filter.name = evt.target.value
        this.$emit('filterRename', this.filter)
        this.isRenaming = false
      } else {
        this.$nextTick(() => {
          evt.target.value = this.selectedFilter.name
          this.isRenaming = false
        })
      }
    },
    onKeyDown (evt) {
      if (evt.keyCode === 13) {
        if (evt.target.value !== '') {
          this.filter.name = evt.target.value
          this.$emit('filterRename', this.filter)
        }
        this.isRenaming = false
      } else if (evt.keyCode === 27) {
        this.isRenaming = false
        evt.target.value = this.selectedFilter.name
      }
    }
  },

  beforeDestroy () {
    clearTimeout(this.inputTimeout)
  }
}
</script>
