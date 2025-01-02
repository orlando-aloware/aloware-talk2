<template>
  <div class="d-flex flex-column truncate-chip-labels">
    <span class="d-flex align-items-center cursor-pointer text-primary"
          :id="`comm-tag-${_uid}`">
      <add-icon-circle height="14"
                       width="14"
                       color="#256EFF"/>
        <span class="ml-1">
          Add Tags
        </span>
    </span>
    <tags-cell-list see-more-new-line
                    see-more-class="text-primary"
                    :tags="communication.tags"
                    v-if="communication.tags?.length" />

    <b-popover placement="bottom"
               triggers="click blur"
               :target="`comm-tag-${_uid}`">
      <entity-tags start-editing
                   entity="communication"
                   entity-type="contacts"
                   :entity-object="communication"
                   :category="TagCategories.CAT_COMMUNICATIONS"
                   :use-card="false"
                   :use-add-icon="true" />
    </b-popover>
  </div>
</template>

<script>
import TagsCellList from 'components/tags/tags-cell-list.vue'
import EntityTags from 'components/generic-selectors/entity-tags.vue'
import AddIconCircle from 'components/icons/add-icon-circle.vue'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'

export default {
  name: 'CommunicationsTags',

  components: {
    AddIconCircle,
    TagsCellList,
    EntityTags
  },

  props: {
    communication: {
      type: Object,
      required: false
    }
  },

  data: () => ({
    TagCategories
  })
}
</script>
