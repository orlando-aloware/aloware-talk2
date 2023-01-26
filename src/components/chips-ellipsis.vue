<template>
  <div class="position-relative">
    <div :class="headerClass"
         v-if="headerLabel">
      <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
        {{ headerLabel }}
      </div>
    </div>
    <div class="d-flex t-menu__content over-flow px-3">
      <div class="chip-ellipsis position-relative">
        <b-overlay class="h-100 w-100 position-absolute"
                   rounded="sm"
                   :show="true"
                   v-show="loading">
          <template #overlay>
            <q-spinner-bars color="primary"
                            size="40px" />
          </template>
        </b-overlay>
        <template v-if="hasContent">
          <template
            v-for="(chip, key) in filteredListItems">
            <q-chip
              outline
              clickable
              square
              :class="`${chip.id === selectedItemId ? 'active' : ''} p-0 mx-2`"
              :style="`border:${chip.id === selectedItemId ? '#256eff' : chip.color || '#ebebeb'} solid 1px;`"
              :key="`1-${key}`"
              :color="`grey-5`"
              :enabled="!loading"
              v-if="key < displayCount"
              @click="onClick(chip)">
              <div
                :class="`chip-label text-capitalize ${identity === 'contact-disposition' ? 'text-grey-7' : 'text-black'}`">
                {{ chip.name }}
              </div>
            </q-chip>
          </template>
          <b-dropdown
            v-if="hasExceededLimit"
            text="..."
            no-caret
            right size="sm"
            variant="white"
            :class="`scrollable-dropdown-list m-1 b-compact-dropdown-button text-bold dropdown-white ${hasSelectedObject ? 'dropdown-active' : ''} contacts-options-dropdown`">
            <template #button-content>
              <i :class="`fa fa-ellipsis-h ${hasSelectedObject ? 'text-primary' : ''}`"></i>
            </template>
            <template
              v-for="(chip, key) in filteredListItems">
              <b-dropdown-item
                href="#"
                :key="`2-${key}`"
                :class="`${chip.id === selectedItemId ? 'active' : ''}`"
                :enabled="!loading"
                v-if="key >= displayCount"
                @click="onClick(chip)">
                {{ chip.name }}
              </b-dropdown-item>
            </template>
          </b-dropdown>
        </template>
        <div
          v-else
          class="text-caption text-grey-6 text-weight-bold">
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
    }
  },
  data () {
    return {
      loading: false
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
            // listItems.splice(key, 1)
          }
        })
      }
      if (flag.data && listItems) {
        // listItems.unshift(flag.data)
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
    }
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
    }
  }
}
</script>
