<template>
  <div v-if="hasPermissionTo(`view contact list`)">
    <div class="w-100 lists-wrapper"
         :class="{ 'lists-wrapper--dense': dense }"
         :data-testid="`${entity}-lists-wrapper`"
         v-if="!useCard">
      <contacts-list-multi-select :data-testid="`${entity}-lists-multi-select`"
                                  :label="label"
                                  :button-text="buttonText"
                                  :values="listIds"
                                  :current="currentLists"
                                  :can-edit="hasPermissionTo(['list contact list item', 'view contact list item'])"
                                  :options-is-grouped="true"
                                  :height="height"
                                  :is-filter="isFilter"
                                  :dense="dense"
                                  :placeholder="placeholder"
                                  @lists-values-updated="handleSaveListsOrFilteringLists">
        <template v-slot:button
                  v-if="useAddIcon">
          <add-icon-circle height="14"
                           width="14"
                           data-testid="entity-lists-add-icon"
                           color="#256EFF"/>
          <span class="ml-1">
            {{ buttonText }}
          </span>
        </template>
      </contacts-list-multi-select>
    </div>
    <b-card class="border-0 lists-wrapper"
            data-testid="contact-lists-wrapper"
            :class="{ 'lists-filter-wrapper': isFilter, 'lists-wrapper--dense': dense }"
            v-else>
      <contacts-list-multi-select :data-testid="`${entity}-lists-multi-select`"
                                  :label="label"
                                  :button-text="buttonText"
                                  :values="listIds"
                                  :current="currentLists"
                                  :can-edit="hasPermissionTo(['list contact list item', 'view contact list item'])"
                                  :options-is-grouped="true"
                                  :height="height"
                                  :is-filter="isFilter"
                                  :dense="dense"
                                  :placeholder="placeholder"
                                  @lists-values-updated="handleSaveListsOrFilteringLists">
      </contacts-list-multi-select>
    </b-card>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import ContactsListMultiSelect from 'components/generic-selectors/contacts-list-multi-select'
import AddIconCircle from 'components/icons/add-icon-circle'

export default {
  name: 'entity-lists',

  mixins: [aclMixin],

  components: {
    AddIconCircle,
    ContactsListMultiSelect
  },

  props: {
    entityObject: {
      required: false,
      type: Object,
      default: null
    },

    entity: {
      required: true,
      type: String
    },

    entityType: {
      required: true,
      type: String
    },

    label: {
      required: false,
      type: String,
      default: ''
    },

    buttonText: {
      required: false,
      type: String,
      default: 'Add Lists'
    },

    useAddIcon: {
      required: false,
      type: Boolean,
      default: true
    },

    useCard: {
      required: false,
      type: Boolean,
      default: true
    },

    exclude: {
      required: false,
      default: null
    },

    height: {
      required: false,
      type: Number,
      default: 350
    },

    category: {
      required: false,
      type: Number,
      default: null
    },

    isFilter: {
      required: false,
      type: Boolean,
      default: false
    },

    filterValues: {
      required: false,
      type: Array,
      default: () => []
    },

    filterValuesObjects: {
      required: false,
      type: Array,
      default: () => []
    },

    dense: {
      required: false,
      type: Boolean,
      default: false
    },

    placeholder: {
      required: false,
      type: String,
      default: 'Type at least 3 characters'
    }
  },

  data () {
    return {
      options: [],
      selectedListsObjects: []
    }
  },

  computed: {
    currentLists () {
      if (this.isFilter) {
        return this.filterValuesObjects ?? []
      }

      return this.entityObject?.lists ?? []
    },

    listIds () {
      if (this.isFilter) {
        return this.filterValues
      }

      if (this.entityObject?.list_ids) {
        return this.entityObject.list_ids
      }

      if (this.entityObject?.lists) {
        return this.entityObject.lists.map((list) => list.id)
      }

      return []
    }
  },

  created () {
    if (this.entityObject && !this.entityObject.list_ids && this.entityObject.lists) {
      this.entityObject.list_ids = this.entityObject.lists.map((o) => o.id)
    }
  },

  methods: {
    handleSaveListsOrFilteringLists (listsIds, listsObjects) {
      if (this.isFilter) {
        return this.updateFilteringLists(listsIds, listsObjects)
      }
    },

    updateFilteringLists (listsIds, listsObjects) {
      this.selectedListsObjects = listsObjects
      this.$emit('filter', listsIds, listsObjects)
    }
  }
}
</script>
