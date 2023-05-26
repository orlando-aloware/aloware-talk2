<template>
  <div class="position-relative">
    <div :class="headerClass"
         v-if="headerLabel">
      <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
        {{ headerLabel }}
        <span class="text-xxs2 text-danger text-capitalize font-weight-bold"
              v-if="isForcedAndNotDisposed">
        Required
      </span>
      </div>
    </div>
    <div class="d-flex t-menu__content over-flow px-3">
      <div class="chip-ellipsis position-relative"
           :class="dispositionClass">
        <b-overlay class="h-100 w-100 position-absolute"
                   :class="overlayClass"
                   :show="disabled || loading">
          <template #overlay>
            <div v-if="disabled"></div>
            <q-spinner-bars color="primary"
                            size="20px"
                            v-else/>
          </template>
        </b-overlay>
        <div class="pl-1"
             v-if="hasContent">
          <template v-for="(chip, key) in filteredListItems">
            <q-chip outline
                    clickable
                    square
                    :class="getChipClass(chip.id)"
                    :style="getChipStyle(chip.id, chip.color)"
                    :key="`1-${key}`"
                    :color="`grey-5`"
                    :enabled="!disabled && !loading"
                    v-if="key < displayCount"
                    @click="onClick(chip)">
              <div :class="chipContentClass">
                {{ chip.name }}
              </div>
            </q-chip>
          </template>
          <b-dropdown text="..."
                      no-caret
                      right size="sm"
                      variant="white"
                      :disabled="disabled || loading"
                      :class="dropdownClass"
                      v-if="hasExceededLimit">
            <template #button-content>
              <i :class="dropdownIconClass"></i>
            </template>
            <template
              v-for="(chip, key) in filteredListItems">
              <b-dropdown-item href="#"
                               :key="`2-${key}`"
                               :class="getDropdownItemClass(chip.id)"
                               :enabled="!loading"
                               v-if="key >= displayCount"
                               @click="onClick(chip)">
                {{ chip.name }}
              </b-dropdown-item>
            </template>
          </b-dropdown>
        </div>
        <div class="text-caption text-grey-6 text-weight-bold"
             v-else>
          {{ defaultLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChipsEllipsis',

  props: {
    identity: {
      type: String,
      default: 'item'
    },

    listItems: {
      type: Array,
      default: () => []
    },

    selectedItem: {
      type: [Number, String],
      default: null
    },

    displayCount: {
      type: Number,
      default: 0
    },

    defaultLabel: {
      type: String,
      default: 'No record found'
    },

    headerLabel: {
      type: String,
      required: false,
      default: ''
    },

    headerClass: {
      type: String,
      required: false,
      default: ''
    },

    initiallyDisabled: {
      type: Boolean,
      required: false,
      default: false
    },

    forced: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false,
      disabled: true
    }
  },

  computed: {
    filteredListItems () {
      const listItems = [...this.listItems]
      const flag = { data: null }

      if (this.selectedItem) {
        listItems.forEach((list, key) => {
          if (list.id === this.selectedItem) {
            listItems.splice()
            flag.data = list
          }
        })
      }

      if (flag.data && listItems) {
        return listItems
      }

      return this.listItems
    },

    hasContent () {
      return this.listItems?.length > 0
    },

    selectedItemId () {
      return this.selectedItem || ''
    },

    selectedItemObject () {
      return this.filteredListItems.find((list, index) => {
        if (index >= this.displayCount) {
          return list.id === this.selectedItemId
        }
      })
    },

    hasSelectedObject () {
      if (this.selectedItemObject?.id) {
        return true
      }

      return false
    },

    hasExceededLimit () {
      return this.listItems.length > this.displayCount
    },

    dispositionClass () {
      if (this.disabled || this.loading || this.selectedItem || !this.hasContent) {
        return []
      }

      const forcedClass = this.forced ? 'border-required border-rounded' : ''

      return [
        forcedClass
      ]
    },

    overlayClass () {
      if (this.disabled || !this.loading || !this.hasContent) {
        return []
      }

      const forcedClass = this.forced ? 'border-required border-rounded' : ''

      return [
        forcedClass
      ]
    },

    chipContentClass () {
      const newClass = this.identity === 'contact-disposition' ? 'text-grey-7' : 'text-black'

      return [
        'chip-label text-capitalize',
        newClass
      ]
    },

    dropdownClass () {
      const activeClass = this.hasSelectedObject ? 'dropdown-active' : ''

      return [
        'scrollable-dropdown-list m-1 b-compact-dropdown-button text-bold dropdown-white',
        activeClass,
        'contacts-options-dropdown'
      ]
    },

    dropdownIconClass () {
      const textColor = this.hasSelectedObject ? 'text-primary' : ''

      return [
        'fa fa-ellipsis-h',
        textColor
      ]
    },

    isForcedAndNotDisposed () {
      return this.hasContent && !this.disabled && !this.loading &&
        this.forced && !this.selectedItem && this.selectedItem !== 0
    }
  },

  created () {
    this.disabled = this.initiallyDisabled
  },

  methods: {
    onClick (chip) {
      this.$emit('on-selected-item', chip)
      this.loading = true
    },

    showLoading () {
      this.loading = true
    },

    hideLoading () {
      this.loading = false
    },

    disable () {
      this.disabled = true
    },

    enable () {
      this.disabled = false
    },

    getChipClass (id) {
      const newClass = id === this.selectedItemId ? 'active' : ''

      return [
        newClass,
        'p-0 mx-2'
      ]
    },

    getChipStyle (id, color) {
      const borderColor = id === this.selectedItemId ? '#256eff' : color || '#ebebeb'
      return `border: ${borderColor} solid 1px;`
    },

    getDropdownItemClass (id) {
      const activeClass = id === this.selectedItemId ? 'active' : ''

      return [
        activeClass
      ]
    }
  }
}
</script>
