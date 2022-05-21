<template>
  <div>
    <template
      v-if="!computedResource.tags || (computedResource.tags && !computedResource.tags.length)">
      <span>--</span>
    </template>
    <template
      v-if="Array.isArray(computedResource.tags) && computedResource.tags.length">
      <div
        :id="`popover-tags-${computedResource.contact_list_item_id}`"
        class="d-flex align-items-center computedResource-tags-item"
        v-if="computedResource.contact_list_item_id">
        <span
          :style="`color: ${computedResource.tags[0].color};`">
          <i
            class="fa fa-circle"
            :style="`color: ${computedResource.tags[0].color};font-size:50%;position: relative; top: -2px;`">
          </i>
          <span
            v-if="computedResource.tags.length > 1">
            {{ computedResource.tags[0].name | truncate(17) }}
          </span>
          <span
            v-else>
            {{ computedResource.tags[0].name | truncate(27) }}
          </span>
        </span>
        <span
          v-if="computedResource.tags.length > 1"
          class="ml-1 text-grey-7 text-caption">
          +{{ (computedResource.tags.length - 1) }} more
        </span>
      </div>
      <b-popover
        triggers="hover"
        placement="topright"
        boundary="window"
        :target="`popover-tags-${computedResource.contact_list_item_id}`"
        v-if="computedResource.contact_list_item_id">
        <template #title>
          <div
            class="contact-tags-title">
            Tags
          </div>
        </template>
        <span
          class="d-flex align-items-center contact-tags-item"
          v-for="tag in computedResource.tags"
          :key="tag.id">
          <span
            :style="`color: ${tag.color};`">
            <i
              class="fa fa-circle"
              :style="`color: ${tag.color};font-size:50%;position: relative; top: -2px;`">
            </i>
            {{ tag.name }}
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
    resource: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    computedResource () {
      return this.resource
    }
  }
}
</script>
