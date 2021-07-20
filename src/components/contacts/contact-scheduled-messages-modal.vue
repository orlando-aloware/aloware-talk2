<template>
  <b-modal
    v-model="isScheduledMessageListOpen"
    size="lg"
    :title="title"
    modal-class="scheduled-messages-modal"
    @hidden="onHidden"
    @show="onShow"
  >
    <b-row>
      <b-col cols="12" class="d-flex justify-between">
        <b-form inline class="mb-2" style="width: 60%">
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
                           v-model="filter.sort"
                           @select="onSort">
          </vue-multiselect>
          <b-button variant="primary" @click="refreshList">Refresh List</b-button>
        </b-form>
        <span class="row-summary">Showing {{ messages.length }} of {{ totalRows }} </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-table hover
                   :busy="isBusy"
                   :items="messages"
                   :fields="fields">
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
                        variant="outline-danger" @click="onDelete(data.item)">
                <trash-o-icon></trash-o-icon>
              </b-button>
            </template>
          </b-table>
        <hr/>
        <div class="d-flex justify-content-center">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="filter.size"
            aria-controls="my-table" @change="onPagination">
          </b-pagination>
        </div>
      </b-col>
    </b-row>
    <template slot="modal-footer">
      <b-button
        variant="success"
        class="custom-btn"
        size="sm"
        @click="onHidden"
      >
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

export default {
  name: 'contact-scheduled-messages-modal',
  components: { TrashOIcon, VueMultiselect },
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
          value: 'scheduled',
          label: 'Scheduled Date'
        },
        {
          value: 'latest',
          label: 'Created Date'
        }
      ],
      filter: {
        sort: {
          value: 'scheduled',
          label: 'Scheduled Date'
        },
        size: 10,
        page: 1
      },
      currentPage: 1,
      totalRows: 0
    }
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
      return process.env.API_URL + '/static/uploaded_file/' + uuid
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
              this.$q.notify({
                message: 'Scheduled message has been deleted.',
                type: 'positive',
                textColor: 'white',
                position: 'bottom-right'
              })
              this.getMessages()
            }).catch(() => {
              this.$q.notify({
                message: 'Error while deleting scheduled message.',
                type: 'negative',
                textColor: 'white',
                position: 'bottom-right'
              })
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
    }
  }
}
</script>

<style src="../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss" scoped>
  .preview.file-name {
  max-width: 45px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

  span.row-summary {
    display: block;
    margin-top: 8px;
  }

  .media-preview-wrapper div:not(:first-child) {
    margin-left: 10px;
  }

  .media-preview-wrapper {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 5px;
    padding-right: 1px;

    .media-preview {
      position: relative;

      .img-preview {
        height: 40px;
        width: 40px;
        border: 1px solid #EBEBEB;;
        border-radius: 6px;
        padding: 2px;
      }

      .pdf-thumbnail-wrapper {
        padding: 4px;
        width: 50px;
        height:39px;
        border-radius: 8px;
        border: 1px solid #EBEBEB;

        i.media-icon {
          color: #FE2216;
        }

        p {
          font-size: 10px;
          max-width: 90px;
        }

        .pdf-preview {
          overflow: hidden !important;
        }
      }

      .audio-thumbnail-wrapper {
        padding: 4px;
        width: 100px;
        height: 76px;
        border-radius: 8px;
        border: 1px solid #EBEBEB;

        p {
          font-size: 10px;
          max-width: 90px;
        }
      }

      .video-thumbnail-wrapper {
        height: 76px;
        width: 76px;
        border-radius: 8px;
        border: 1px solid #EBEBEB;
        padding: 4px;

        .embed-responsive {
          height: 100%;
        }

        .btn-play {
          position: absolute;
          top: 29%;
          left: 31%;
          color: #62666E;
          cursor: inherit;
        }
      }

    }

    .media-preview:hover{
      .btn-remove-attachments {
        opacity: 1;
      }
    }

    .media-icon-wrapper {
      height: 18px;
      width: 42px;
      //background: #EBEBEB;
      border-radius: 6px;
      text-align: center;
      margin: auto;

      i.media-icon {
        //margin-top: 10px;
        font-size: 12px;
        color: #B5B7BB;;
      }
    }
  }
</style>
