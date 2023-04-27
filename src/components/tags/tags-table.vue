<template>
  <div class="tags-table position-relative">
    <datatable paginated
               show-pagination
               sticky-headers
               use-empty-slot
               custom-class="pr-3"
               scroll-area-class="scroll-type-2"
               :columns="columns"
               :is-empty="tags.length === 0"
               :is-loading="isLoading"
               :is-loading-more="isLoading"
               :total-rows="pagination.total"
               :current-page="pagination.currentPage"
               :last-page="pagination.lastPage">

      <template #tbody>
        <tr class="datatable-row"
            :key="`${index}`"
            v-for="(tag, index) in tags">
          <template v-for="(column, colIndex) in columns">
            <td
                v-if="column.name === 'checkbox'"
                :key="`col-${colIndex}`"
                class="text-left pull-left datatable-row__checkbox">

                <label class="custom-checkbox-container">
                  <input
                    type="checkbox"
                    class="checker"
                    :value="tag.id" />
                  <span class="checkmark"></span>
                </label>
              </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'id'">
              {{ tag.id }}
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'name'">
              {{ tag.name }}
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'color'">
              <i class="fa fa-square"
                 :style="{ color: tag.color }">
              </i>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'updated_at'">
              {{ tag.updated_at | fixFullDateTime }}
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'description'">
              {{ tag.description }}
            </td>

            <td :key="`col-${colIndex}`"
                v-if="category === TAG_CATEGORIES.CAT_COMMUNICATIONS && column.name === 'communications_count'">
              <span v-if="tag.communications_count > 0"
                    class="badge badge-light">
                {{ tag.communications_count }}
              </span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="category === TAG_CATEGORIES.CAT_CONTACTS && column.name === 'contacts_count'">
              <span v-if="tag.contacts_count > 0"
                    class="badge badge-light">
                {{ tag.contacts_count }}
              </span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'actions'">
              <!-- Redirect to Communications -->
              <div v-if="category === TAG_CATEGORIES.CAT_COMMUNICATIONS && tag.communications_count > 0">
                <b-button variant="light"
                          size="sm"
                          class="mb-1 w-100">
                  <i class="fa fa-signal pull-left"></i> Communications
                </b-button>
              </div>

              <!-- Redirect to Contacts -->
              <div v-if="category === TAG_CATEGORIES.CAT_CONTACTS && tag.contacts_count > 0">
                <div>
                  <b-button variant="light"
                            size="sm"
                            class="mb-1 w-100">
                    <i class="fa fa-user pull-left"></i> Contacts
                  </b-button>
                </div>

                <div v-if="hasRole('Company Admin')">
                  <div v-if="tag.contacts_count > 50">
                    <tag-contacts-splitter />
                  </div>

                  <div>
                    <assign-contacts-by-tag />
                  </div>

                  <div>
                    <tag-contacts-add-to-power-dialer />
                  </div>

                  <div>
                    <tag-contacts-workflow-enroller />
                  </div>
                </div>
              </div>

              <!-- Edit -->
              <div v-if="hasPermissionTo('update tag')">
                <b-button variant="primary"
                          size="sm"
                          class="mb-1 w-100  btn-sm">
                  <i class="fa fa-edit pull-left"></i> Edit
                </b-button>
              </div>

              <!-- Delete -->
              <div v-if="hasPermissionTo('delete tag')">
                <b-button variant="danger"
                          size="sm"
                          class="w-100">
                  <i class="fa fa-trash pull-left"></i> Delete
                </b-button>
              </div>
            </td>
          </template>
        </tr>
      </template>

    </datatable>
  </div>
</template>

<script>
import Datatable from 'components/datatable.vue'
import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import { aclMixin } from 'src/plugins/mixins'
import { fixDateTime } from '../../plugins/filters/datetime.filters'
import AssignContactsByTag from 'components/tags/assign-contacts-by-tag.vue'
import TagContactsSplitter from 'components/tags/tag-contacts-splitter.vue'
import TagContactsAddToPowerDialer from 'components/tags/tag-contacts-add-to-power-dialer.vue'
import TagContactsWorkflowEnroller from 'components/tags/tag-contacts-workflow-enroller.vue'
export default {
  name: 'tags-table',
  methods: { fixDateTime },

  components: { TagContactsWorkflowEnroller, TagContactsAddToPowerDialer, TagContactsSplitter, AssignContactsByTag, Datatable },

  mixins: [
    aclMixin
  ],

  props: {
    tags: {
      type: Array,
      required: true
    },

    category: {
      type: Number,
      required: true
    },

    isLoading: {
      type: Boolean,
      required: true,
      default: false
    },

    pagination: {
      type: Object,
      required: true
    }
  },

  computed: {
    TAG_CATEGORIES () {
      return TAG_CATEGORIES
    },

    columns () {
      let cols = [
        { name: 'checkbox', label: 'Checkbox' },
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'color', label: 'Color' },
        { name: 'updated_at', label: 'Date' },
        { name: 'description', label: 'Description' }
      ]

      switch (this.category) {
        case TAG_CATEGORIES.CAT_COMMUNICATIONS:
          cols.push({ name: 'communications_count', label: '# of Communications' })
          break

        case TAG_CATEGORIES.CAT_CONTACTS:
          cols.push({ name: 'contacts_count', label: '# of Contacts' })
          break
      }

      cols.push({ name: 'actions', label: 'Actions' })

      return cols
    }
  }
}
</script>
