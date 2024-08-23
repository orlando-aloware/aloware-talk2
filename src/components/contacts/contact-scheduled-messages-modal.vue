<template>
  <b-modal
    v-model="isOpen"
    size="lg"
    :title="title"
    modal-class="scheduled-messages-modal"
    data-testid="contact-scheduled-messages-modal"
    @hidden="onHidden"
    @show="onShow"
  >
    <b-row>
      <b-col cols="12" class="d-flex justify-between">
        <b-form inline class="mb-2" style="width: 60%" data-testid="contact-scheduled-messages-form">
          <vue-multiselect track-by="value"
                           label="label"
                           class="mr-1"
                           style="width: 40%"
                           :placeholder="placeholder"
                           :searchable="true"
                           :showNoResults="false"
                           :close-on-select="true"
                           :options="sortOptions"
                           :show-labels="false"
                           :allow-empty="false"
                           data-testid="contact-scheduled-messages-multiselect-sort"
                           v-model="filter.sort">
          </vue-multiselect>
          <b-button data-testid="contact-scheduled-messages-refresh-list-button" variant="primary" @click="refreshList">Refresh List</b-button>
        </b-form>
        <span class="row-summary">Showing {{ messages.length }} of {{ totalRows }} </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-table hover
                 show-empty
                 :busy="isBusy"
                 :items="messages"
                 data-testid="contact-scheduled-messages-table"
                 :fields="fields">
          <template #empty>
            <h5 class="text-center mt-2">No scheduled messages found..</h5>
          </template>
          <template #table-busy>
            <div class="text-center text-danger my-2">
              <div>
                <q-spinner-bars
                  color="primary"
                  size="2em"
                />
              </div>
            </div>
          </template>
          <template #cell(message)="data">
            <span v-if="data.item.message.length < 100">{{ data.item.message }}</span>
            <span v-else v-b-tooltip="data.item.message">{{ data.item.message | strLimit(100)  }}</span>
          </template>

          <template #cell(upload_files)="data">
            <span v-if="!data.item.gif_url && data.item.uploaded_files.length < 1">----</span>
            <div class="mb-2 d-inline-flex media-preview-wrapper">
                <div v-if="data.item.gif_url" class="media-preview">
                  <img class="img-preview" height="20px" width="20px"
                       data-testid="contact-scheduled-messages-gif"
                       :src="data.item.gif_url"/>
                </div>

                <div v-for="attachment in data.item.uploaded_files" :key="attachment.id" class="media-preview">
                <div v-if="attachment.mimetype.includes('audio')" class="audio-thumbnail-wrapper">
                  <div class="text-center media-icon-wrapper">
                    <i class="fa fa-microphone media-icon"></i>
                  </div>
                  <p class="ellipsis text-center">{{ attachment.original_file }}</p>
                </div>
                <div v-if="attachment.mimetype.includes('pdf')" class="pdf-thumbnail-wrapper">
                  <div class="text-center media-icon-wrapper">
                    <i class="far fa-file-pdf media-icon"></i>
                  </div>
                  <p class="ellipsis text-center">{{ attachment.original_file }}</p>
                </div>
                <div v-if="attachment.mimetype.includes('video')" class="video-thumbnail-wrapper">
                  <b-embed type="video" aspect="1by1">
                    <source :src="getPreviewLink(attachment.uuid)" :type="attachment.mimetype">
                  </b-embed>
                  <b-button pill size="sm" variant="light" class="btn-play"> <i class="fa fa-play"></i> </b-button>
                </div>
                <div v-if="attachment.mimetype.includes('image')">
                  <img  class="img-preview"
                        data-testid="contact-scheduled-messages-image"
                        :src="getPreviewLink(attachment.uuid)"/>
                </div>
              </div>
              </div>
          </template>

          <template #cell(scheduled_at)="data">
            {{ data.item.scheduled_at | momentFormat('MMM D, yyyy hh:mm a', true)  }}
          </template>

          <template #cell(user)="data">
            {{ data.item.user.full_name  }}
          </template>
          <template #cell(action)="data">
            <b-button size="sm"
                      variant="outline-danger"
                      data-testid="contact-scheduled-messages-delete-button"
                      @click="onDelete(data.item)">
              <trash-o-icon></trash-o-icon>
            </b-button>
          </template>
        </b-table>
        <hr/>
        <div class="d-flex justify-content-center">
          <b-pagination aria-controls="my-table"
                        v-model="currentPage"
                        data-testid="contact-scheduled-messages-pagination"
                        :total-rows="totalRows"
                        :per-page="filter.size"
                        @change="onPagination">
          </b-pagination>
        </div>
      </b-col>
    </b-row>
    <template slot="modal-footer">
      <b-button variant="success"
                class="custom-btn"
                size="sm"
                data-testid="contact-scheduled-messages-close-button"
                @click="onHidden">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import TrashOIcon from 'components/icons/trash-o-icon'
import VueMultiselect from 'vue-multiselect'
import { classicMixin, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-scheduled-messages-modal',
  components: { TrashOIcon, VueMultiselect },
  mixins: [
    classicMixin,
    simpsocialMixin
  ],
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', ['isScheduledMessageListOpen']),
    title () {
      return `Schedule Messages for ${this.contact.first_name} ${this.contact.last_name}`
    }
  },
  data () {
    return {
      isOpen: false,
      isBusy: false,
      isDeleting: false,
      messages: [],
      fields: [
        {
          key: 'message',
          label: 'Message'
        },
        {
          key: 'upload_files',
          label: 'Media'
        },
        {
          key: 'scheduled_at',
          label: 'Scheduled For'
        },
        {
          key: 'user',
          label: 'Scheduled By'
        },
        {
          key: 'action',
          label: ''
        }
      ],
      placeholder: 'Sort by',
      sortOptions: [
        {
          value: 'schedule',
          label: 'Scheduled Date'
        },
        {
          value: 'latest',
          label: 'Created Date'
        }
      ],
      filter: {
        sort: {
          value: 'schedule',
          label: 'Scheduled Date'
        },
        size: 10,
        page: 1
      },
      currentPage: 1,
      totalRows: 0
    }
  },
  created () {
    this.isOpen = this.isScheduledMessageListOpen
  },
  methods: {
    onPagination (page) {
      this.filter.page = page
      this.getMessages()
    },
    onSort () {
      this.getMessages()
    },
    refreshList () {
      this.getMessages()
    },
    ...mapActions('contacts', ['scheduledMessageListOpen']),
    getPreviewLink (uuid) {
      return `${this.getClassicURL(this.isSimpSocial)}/static/uploaded_file/${uuid}`
    },
    isAttachmentImage (mimeType) {
      return mimeType.includes('image/')
    },

    isAttachmentVideo (mimeType) {
      return mimeType.includes('video/')
    },

    isAttachmentAudio (mimeType) {
      return mimeType.includes('audio/')
    },

    isAttachmentText (mimeType) {
      return mimeType.includes('text/')
    },

    isAttachmentApplication (mimeType) {
      return mimeType.includes('application/')
    },
    onHidden () {
      this.scheduledMessageListOpen(false)
    },
    onShow () {
      this.getMessages()
    },
    getMessages () {
      this.isBusy = true
      return talk2Api.V1.message.getScheduledByContact(this.contact.id, {
        size: this.filter.size,
        sort: this.filter.sort.value,
        page: this.filter.page
      }).then(response => {
        this.messages = response.data.data
        this.totalRows = response.data.total
        this.currentPage = response.data.current_page
      }).finally(() => {
        this.isBusy = false
      })
    },
    onDelete (message) {
      this.$bvModal.msgBoxConfirm('Do you wish to delete selected scheduled message?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'No'
      }).then(confirm => {
        if (confirm) {
          this.isDeleting = true
          talk2Api.V1.message.deleteScheduledMessage(message.id)
            .then(response => {
              this.$generalNotification('Scheduled message has been deleted.')
              this.getMessages()
            }).catch((err) => {
              this.$handleErrors(err.response)
            }).finally(() => {
              this.isDeleting = false
            })
        }
      })
    }
  },
  watch: {
    'isScheduledMessageListOpen': function (value) {
      this.isOpen = value
    },
    'filter.sort': {
      deep: true,
      handler () {
        this.getMessages()
      }
    }
  }
}
</script>

<style src="../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
