<template>
  <div>

    <template
      v-for="(chip, key) in listItems">
      <q-chip
        v-if="key < displayCount"
        :key="`${identity}-${chip.name}-${key}`"
        @click="$emit('on-selected-item', chip)"
        :color="`grey-5`"
        outline clickable
        square
        :style="`border:${chip.color} solid 1px;`"
        :class="`p-0 mx-2`">
        <div :class="`text-capitalize ${identity === 'contact-disposition' ? 'text-grey' : 'text-black'}`">
          {{ chip.name }}
        </div>
      </q-chip>
    </template>

    <b-dropdown
      text="..."
      no-caret
      right size="sm"
      variant="white"
      class="scrollable-dropdown-list m-1 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
      <template #button-content>
        <i class="fa fa-ellipsis-h"></i>
      </template>
      <template
        v-for="(chip, key) in listItems">
        <b-dropdown-item
          v-if="key >= displayCount"
          :key="`${identity}-${chip.name}-${key}`"
          @click="$emit('on-selected-item', chip)"
          href="#">
          {{ chip.name }}
        </b-dropdown-item>
      </template>
    </b-dropdown>

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
    displayCount: {
      type: Number,
      default: 0
    }
  }
}
</script>
