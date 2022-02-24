<template>
  <div class="chip-ellipsis">

    <template v-if="hasContent">

      <template
        v-for="(chip, key) in filteredListItems">
        <q-chip
          :class="`${chip.id === selectedItemId ? 'active' : ''} p-0 mx-2`"
          :style="`border:${chip.id === selectedItemId ? '#256eff' : chip.color || '#ebebeb'} solid 1px;`"
          :key="`${identity}-${chip.name}-${key}`"
          :color="`grey-5`"
          outline clickable
          square
          v-if="key < displayCount"
          @click="$emit('on-selected-item', chip)">

          <div
            :class="`chip-label text-capitalize ${identity === 'contact-disposition' ? 'text-grey-7' : 'text-black'}`">
            {{ chip.name }}
          </div>

        </q-chip>
      </template>

      <b-dropdown
        v-if="!hasReachedLimit"
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
            v-if="key >= displayCount"
            :key="`${identity}-${chip.name}-${key}`"
            @click="$emit('on-selected-item', chip)"
            :class="`${chip.id === selectedItemId ? 'active' : ''}`"
            href="#">
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
    }
  },
  computed: {
    filteredListItems () {
      const listItems = [ ...this.listItems ]
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
    hasReachedLimit () {
      return this.listItems.length < this.displayCount
    }
  }
}
</script>
