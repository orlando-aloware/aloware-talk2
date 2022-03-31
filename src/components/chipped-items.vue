<template>
  <div>
    <template
      v-if="!resourceHasContent">
      <span>--</span>
    </template>
    <template
      v-if="Array.isArray(computedResource) && computedResource.length">
      <div
        :id="`chippped-popover-tags-${resource.id}-${meta}`"
        class="d-flex align-items-center computedResource-tags-item"
        v-if="resourceHasContent">
        <span>
          <span
            v-if="computedResource.length > 1">
            {{ computedResource[0][keyName] | truncate(8) }}
            <!-- {{ computedResource[keyName] | truncate(17) }} -->
          </span>
          <span
            v-else>
            {{ computedResource[0][keyName] }}
          </span>
        </span>
        <span
          v-if="computedResource.length > 1"
          class="ml-1 text-grey-7 text-caption">
          +{{ (computedResource.length - 1) }}
        </span>
      </div>
      <b-popover
        triggers="hover"
        placement="topright"
        boundary="window"
        :target="`chippped-popover-tags-${resource.id}-${meta}`"
        v-if="resource.id && resourceHasMoreThanOneContent">
        <template #title>
          <div
            class="contact-tags-title">
            {{ title }}
          </div>
        </template>
        <span
          class="d-flex align-items-center contact-tags-item"
          v-for="(tag, key) in computedResource"
          :key="`${meta}-${tag.id}-${key}`">
          <span>
            <i
              class="fa fa-phone"
              :style="`font-size:60%;position: relative; top: -2px;`">
            </i>
            {{ tag[keyName] }}
          </span>
        </span>
      </b-popover>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TagPopover',
  props: {
    chips: {
      type: Array,
      default: () => []
    },
    resource: {
      type: Object,
      default: () => {}
    },
    keyName: {
      type: String,
      default: 'name'
    },
    title: {
      type: String,
      default: 'List of Items'
    },
    meta: {
      type: String,
      default: 'items'
    }
  },
  computed: {
    resourceHasContent () {
      return this.chips.length > 0
    },
    resourceHasMoreThanOneContent () {
      return this.chips.length > 1
    },
    computedResource () {
      return this.chips
    }
  }
}
</script>
