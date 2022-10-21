<template>
  <div class="no-bg">
    <q-btn class="absolute all-pointer-events"
           icon="file_download"
           color="primary"
           size="16px"
           title="Download"
           dense
           :style="buttonStyle"
           :loading="isLoading"
           :disabled="isLoading"
           v-if="!isSimple && !isSimpleAttachment"
           @click="onDownload" />
    <div class="d-flex align-items-center"
         v-if="isSimple && !isSimpleAttachment">
      <div class="filename-ellipsis"
           v-if="showFileName">
        {{ filenameText }}
      </div>
      <q-btn color="text-dark-greenish"
             class="btn btn-inline px-1 py-0"
             title="Download"
             flat
             rounded
             dense
             no-caps
             :loading="isLoading"
             :disabled="isLoading"
             @click="onDownload">
        <download-icon height="16"
                       width="16">
        </download-icon>
      </q-btn>
    </div>
    <a role="button"
       v-if="isSimpleAttachment && !isSimple"
       @click.prevent="onDownload">
      <div class="py-2 text-right">
        <file-icon width="100" height="100" />
        <p class="mb-0 mt-2"
           style="font-size:.7rem;word-break: break-all;">
          {{ newFilename }}
        </p>
      </div>
    </a>
  </div>
</template>

<script>
import { communicationInfoMixin } from 'src/plugins/mixins'
import DownloadIcon from 'components/icons/contact-activity/download-icon'
import FileIcon from 'components/icons/contact-activity/file-icon'
import { isEmpty } from 'lodash'
export default {
  name: 'download-button',
  mixins: [communicationInfoMixin],
  components: {
    DownloadIcon,
    FileIcon
  },
  props: {
    attachmentUrl: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: '',
      required: true
    },
    buttonStyle: {
      type: String,
      default: '',
      required: false
    },
    isSimple: {
      type: Boolean,
      default: false,
      required: false
    },
    isSimpleAttachment: {
      type: Boolean,
      default: false,
      required: false
    },
    fileUuid: {
      type: String,
      default: null
    },
    showFileName: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data () {
    return {
      isLoading: false,
      newFilename: '',
      filenameText: ''
    }
  },
  created () {
    this.newFilename = this.filename
    this.filenameText = this.filename

    if (isEmpty(this.filename)) {
      this.newFilename = this.getFilenameFromURL(this.attachmentUrl)
      this.filenameText = this.$options.filters.toUpperCase(this.newFilename.split('.').pop())
      this.filenameText += ' File'
    }
  },
  methods: {
    onDownload () {
      this.isLoading = true

      let domain = null

      try {
        domain = new URL(this.attachmentUrl)
      } catch (e) {
        domain = {
          hostname: ''
        }
      }

      // if domain is giphy's
      if (domain.hostname.includes('giphy.com')) {
        this.$downloadFileWithUrl(this.attachmentUrl, this.newFilename)
          .then(() => {
            this.isLoading = false
          }).catch(() => {
            this.isLoading = false
          })
        return
      }

      const fileUuid = !this.fileUuid ? this.getUuidFromURL(this.attachmentUrl) : this.fileUuid
      this.$downloadFileWithUuid(fileUuid, this.newFilename)
        .then(() => {
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
