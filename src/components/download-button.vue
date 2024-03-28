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
           v-if="!isSimple && !isSimpleAttachment && hasFilenameExtension"
           @click="onDownload(false)" />
    <q-btn-dropdown class="download-dropdown absolute all-pointer-events"
                    icon="file_download"
                    color="primary"
                    size="16px"
                    title="Download"
                    dense
                    no-icon-animation
                    :style="buttonStyle"
                    :loading="isLoading"
                    :disabled="isLoading"
                    v-if="!isSimple && !isSimpleAttachment && !hasFilenameExtension">
      <portal-target :name="`downloadDropdownList-${communicationId}`"/>
    </q-btn-dropdown>
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
             v-if="hasFilenameExtension"
             @click="onDownload(false)">
        <download-icon height="16"
                       width="16">
        </download-icon>
      </q-btn>
      <q-btn-dropdown color="download-dropdown text-dark-greenish"
                      class="btn btn-inline px-1 py-0"
                      title="Download"
                      flat
                      rounded
                      dense
                      no-caps
                      no-icon-animation
                      :loading="isLoading"
                      :disabled="isLoading"
                      v-if="!hasFilenameExtension">
        <download-icon height="16"
                       width="16">
        </download-icon>
        <portal-target :name="`downloadDropdownList-${communicationId}`"/>
      </q-btn-dropdown>
    </div>
    <a role="button"
       v-if="isSimpleAttachment && !isSimple"
       @click.prevent="onDownload(false)">
      <div class="py-2 text-right">
        <file-icon width="100" height="100" />
        <p class="mb-0 mt-2"
           style="font-size:.7rem;word-break: break-all;">
          {{ newFilename }}
        </p>
      </div>
    </a>
    <portal :to="`downloadDropdownList-${communicationId}`">
      <q-list>
        <q-item class="p-2"
                clickable
                v-close-popup
                @click="onDownload(true)">
          <q-item-section>
            <q-item-label>Direct download</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="p-2"
                clickable
                v-close-popup
                @click="onOpenBrowserTab(false)">
          <q-item-section>
            <q-item-label>Open in a new browser tab</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </portal>
  </div>
</template>

<script>
import { communicationInfoMixin } from 'src/plugins/mixins'
import DownloadIcon from 'components/icons/contact-activity/download-icon'
import FileIcon from 'components/icons/contact-activity/file-icon'
import mime from 'mime-types'
export default {
  name: 'download-button',

  mixins: [communicationInfoMixin],

  components: {
    DownloadIcon,
    FileIcon
  },

  props: {
    communicationId: {
      type: Number,
      required: true
    },

    attachmentUrl: {
      type: String,
      default: ''
    },

    filename: {
      type: String,
      default: '',
      required: true
    },

    fileMimeType: {
      type: String,
      default: ''
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
      filenameText: '',
      fileUuidValue: null
    }
  },

  computed: {
    hasFilenameExtension () {
      return this.filename.includes('.')
    }
  },

  created () {
    this.initializeFilename()
    this.initializeFileUuid()
  },

  methods: {
    initializeFilename () {
      this.newFilename = this.filename || this.getFilenameFromURL(this.attachmentUrl)
      this.filenameText = `${this.$options.filters.toUpperCase(this.newFilename.split('.').pop())} File`
    },

    initializeFileUuid () {
      this.fileUuidValue = this.fileUuid || this.getUuidFromURL(this.attachmentUrl)
    },

    onDownload (fixFilenameExtension = false) {
      const isNotValidFilenameExtension = !this.hasFilenameExtension && !fixFilenameExtension
      const hasNoMimeType = fixFilenameExtension && !this.fileMimeType

      if (isNotValidFilenameExtension || hasNoMimeType) {
        this.onOpenBrowserTab(true)
        return
      }

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

      let filename = this.newFilename

      if (fixFilenameExtension) {
        filename = `${filename}.${mime.extension(this.fileMimeType)}`
      }

      this.$downloadFileWithUuid(this.fileUuidValue, filename)
        .then(() => {
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
        })
    },

    onOpenBrowserTab (isMissingExtension = false) {
      const url = `${this.attachmentUrl}${(isMissingExtension ? '?force_download=1' : '')}`
      const win = window.open(url, '_blank')
      win.focus()
    }
  }
}
</script>
