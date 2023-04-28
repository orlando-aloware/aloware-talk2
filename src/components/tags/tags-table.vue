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
               :last-page="pagination.lastPage"
               @paginated="paginated"
               @sort="sort">

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
              <i class="fa fa-square mr-1"
                 :style="{ color: tag.color }">
              </i> <span>{{ tag.name }}</span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'updated_at'">
              {{ tag.updated_at | fixDate }}
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'description'">
              <span>{{ tag.description }}</span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="currentTagCategory === CommunicationTags && column.name === 'communications_count'">
              <span v-if="tag.communications_count > 0"
                    class="badge bg-grey-12 text-size-xs">
                {{ tag.communications_count }}
              </span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="currentTagCategory === ContactTags && column.name === 'contacts_count'">
              <span v-if="tag.contacts_count > 0"
                    class="badge bg-grey-12 text-size-xs">
                {{ tag.contacts_count }}
              </span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'actions'">
              <!-- Redirect to Communications -->
              <div v-if="currentTagCategory === CommunicationTags && tag.communications_count > 0">
                <b-button variant="light"
                          size="sm"
                          class="mb-1 w-100"
                          @click="openTagCommunications(tag.id)">
                  <i class="fa fa-signal pull-left"></i> Communications
                </b-button>
              </div>

              <!-- Redirect to Contacts -->
              <div v-if="currentTagCategory === ContactTags && tag.contacts_count > 0">
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
import { aclMixin, tagsMixin } from 'src/plugins/mixins'
import AssignContactsByTag from 'components/tags/assign-contacts-by-tag.vue'
import TagContactsSplitter from 'components/tags/tag-contacts-splitter.vue'
import TagContactsAddToPowerDialer from 'components/tags/tag-contacts-add-to-power-dialer.vue'
import TagContactsWorkflowEnroller from 'components/tags/tag-contacts-workflow-enroller.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'tags-table',

  components: {
    TagContactsWorkflowEnroller,
    TagContactsAddToPowerDialer,
    TagContactsSplitter,
    AssignContactsByTag,
    Datatable
  },

  mixins: [
    aclMixin,
    tagsMixin
  ],

  props: {
    tags: {
      type: Array,
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
    ...mapState('tags', [
      'selectedTagCategory'
    ]),

    columns () {
      let cols = [
        { name: 'checkbox', label: 'Checkbox' },
        { name: 'id', label: 'ID', sortable: true },
        { name: 'name', label: 'Name', sortable: true, resizable: true, minWidth: 150 },
        { name: 'updated_at', label: 'Date', sortable: true },
        { name: 'description', label: 'Description', sortable: true, resizable: true, minWidth: 120 }
      ]

      switch (this.selectedTagCategory) {
        case this.CommunicationTags:
          cols.push({ name: 'communications_count', label: '# of Communications', sortable: true })
          break

        case this.ContactTags:
          cols.push({ name: 'contacts_count', label: '# of Contacts', sortable: true })
          break
      }

      cols.push({ name: 'actions', label: 'Actions', maxWidth: 80 })

      return cols
    }
  },

  methods: {
    ...mapActions('tags', [
      'setSelectedTagCategory'
    ]),

    paginated (pagination) {
      this.$emit('paginated', pagination)
    },

    sort (sorts) {
      this.$emit('sort', sorts)
    },

    openTagCommunications (tagId) {
      window.open(`/channels/all-communications?tagId=${tagId}`, '_blank')
    }
  }
}
</script>
