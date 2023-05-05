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
            <td v-if="column.name === 'checkbox' && hasRole('Company Admin')"
                :key="`col-${colIndex}`"
                class="text-left pull-left datatable-row__checkbox">

                <label class="custom-checkbox-container">
                  <input type="checkbox"
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
                v-if="column.name === 'name'"
                :title="tag.name">
              <i class="fa fa-square mr-1"
                 :style="{ color: tag.color }">
              </i> <span>{{ tag.name }}</span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'updated_at'">
              {{ tag.updated_at | fixDate }}
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'description'"
                :title="tag.description">
              <span>{{ tag.description }}</span>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="selectedTagCategory === CommunicationTags && column.name === 'communications_count'">
              <i class="fas fa-spin fa-spinner"
                 v-show="isLoadingRefreshCount && refreshedTagId === tag.id">
              </i>
              <b-button class="badge bg-grey-12 text-size-xs"
                        v-show="refreshedTagId !== tag.id"
                        v-b-tooltip.hover.left="'Click to Refresh'"
                        @click="refreshCount(tag.id)">
                {{ tag.communications_count }}
              </b-button>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="selectedTagCategory === ContactTags && column.name === 'contacts_count'">
              <i class="fas fa-spinner"
                 v-show="refreshedTagId === tag.id">
              </i>
              <b-button class="badge bg-grey-12 text-size-xs"
                        v-b-tooltip.hover.left="'Click to Refresh'"
                        @click="refreshCount(tag.id)">
                {{ tag.contacts_count }}
              </b-button>
            </td>

            <td :key="`col-${colIndex}`"
                v-if="column.name === 'actions'">
              <!-- Admins -->
              <div v-if="hasRole('Company Admin')"
                   class="text-right w-75"
                  style="{ position: initial }">
                <b-button v-if="hasPermissionTo('update tag') && selectedTagCategory === CommunicationTags && tag.communications_count > 0"
                          title="Communications"
                          variant="transparent"
                          size="sm"
                          @click="openTagCommunications(tag.id)">
                  <communication-signal-icon />
                </b-button>
                <b-button v-if="hasPermissionTo('update tag') && selectedTagCategory === ContactTags && tag.contacts_count > 0"
                          title="Contacts"
                          variant="transparent"
                          size="sm"
                          @click="openTagContacts(tag.id)">
                  <contact-alt-icon />
                </b-button>
                <b-button title="Edit"
                          variant="transparent"
                          size="sm"
                          @click="editTag(tag)">
                  <edit-pen-icon />
                </b-button>
                <b-dropdown class="ml-1 position-absolute"
                            size="sm"
                            right
                            variant="light"
                            no-caret>
                  <template #button-content>
                    <ellipse-icon />
                  </template>
                  <div v-if="selectedTagCategory === ContactTags">
                    <b-dropdown-item>
                      <i class="fas fa-sign-in-alt"></i> Assign Contacts
                    </b-dropdown-item>
                    <b-dropdown-item>
                      <i class="fas fa-columns"></i> Split
                    </b-dropdown-item>
                    <b-dropdown-item>
                      <i class="fas fa-phone"></i> Add to PowerDialer
                    </b-dropdown-item>
                    <b-dropdown-item>
                      <i class="fas fa-user-plus"></i> Enroll Contacts
                    </b-dropdown-item>
                  </div>
                  <b-dropdown-item v-if="hasPermissionTo('delete tag')"
                                   @click="deleteTag(tag)">
                    <span class="text-danger"><delete-red-icon></delete-red-icon> Delete</span>
                  </b-dropdown-item>
                </b-dropdown>
              </div>

              <!-- Agent's Button: Redirect to Communications -->
              <b-button v-if="hasRole('Company Agent') && selectedTagCategory === CommunicationTags && tag.communications_count > 0"
                        variant="light"
                        size="sm"
                        class="mb-1 w-100"
                        @click="openTagCommunications(tag.id)">
                <span v-if="hasRole('Company Agent')"><communication-signal-icon /> Communications</span>
              </b-button>

              <!-- Agent's Button: Redirect to Contacts -->
              <b-button v-if="hasRole('Company Agent') && selectedTagCategory === ContactTags && tag.contacts_count > 0"
                        variant="light"
                        size="sm"
                        class="mb-1 w-100"
                        @click="openTagContacts(tag.id)">
                <span v-if="hasRole('Company Agent')"><contact-alt-icon /> Contacts</span>
              </b-button>
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
import CommunicationSignalIcon from 'components/icons/communication-signal-icon.vue'
import ContactAltIcon from 'components/icons/contact-alt-icon.vue'
import EditPenIcon from 'components/icons/edit-pen-icon.vue'
import EllipseIcon from 'components/icons/ellipse-icon.vue'
import DeleteRedIcon from 'components/icons/delete-red-icon.vue'

export default {
  name: 'tags-table',

  components: {
    Datatable,
    CommunicationSignalIcon,
    ContactAltIcon,
    EditPenIcon,
    EllipseIcon,
    DeleteRedIcon
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

    isLoadingRefreshCount: {
      type: Boolean,
      required: true,
      default: false
    },

    pagination: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      refreshedTagId: null
    }
  },

  computed: {
    columns () {
      let cols = [
        { name: 'id', label: 'ID', sortable: true },
        { name: 'name', label: 'Name', sortable: true, resizable: true, minWidth: 150 },
        { name: 'updated_at', label: 'Date', sortable: true },
        { name: 'description', label: 'Description', sortable: true, resizable: true, minWidth: 150 }
      ]

      if (this.hasRole('Company Admin')) {
        cols = [{ name: 'checkbox', label: 'Checkbox' }, ...cols]
      }

      switch (this.selectedTagCategory) {
        case this.CommunicationTags:
          cols.push({ name: 'communications_count', label: '# of Communications', sortable: true, maxWidth: 80 })
          break

        case this.ContactTags:
          cols.push({ name: 'contacts_count', label: '# of Contacts', sortable: true, maxWidth: 80 })
          break
      }

      cols.push({ name: 'actions', label: 'Actions', maxWidth: 50 })

      return cols
    }
  },

  methods: {
    paginated (pagination) {
      this.$emit('paginated', pagination)
    },

    sort (sorts) {
      this.$emit('sort', sorts)
    },

    openTagCommunications (tagId) {
      window.open(`/channels/all-communications?tagId=${tagId}`, '_blank')
    },

    openTagContacts (tagId) {
      console.log('placeholder for contacts tag: ' + tagId)
    },

    editTag (tag) {
      this.$emit('editTag', tag)
    },

    deleteTag (tag) {
      this.$emit('deleteTag', tag)
    },

    refreshCount (tagId) {
      this.refreshedTagId = tagId
      this.$emit('updateTagCount', tagId)
    }
  },

  watch: {
    isLoadingRefreshCount (value) {
      if (!value) {
        this.refreshedTagId = null
      }
    }
  }
}
</script>
