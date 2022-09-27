import { isEmpty } from 'lodash'
export default {
  methods: {
    downloadFileFromReference (referenceId) {
      if (!isEmpty(this.$refs[referenceId])) {
        this.$refs[referenceId][0].click()
      }
    },

    forceFileDownload (response, title) {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', title)
      document.body.appendChild(link)
      link.click()
    },

    downloadWithAxios (url, title) {
      this.$axios.get(url,
        {
          responseType: 'arraybuffer'
        })
        .then((response) => {
          this.forceFileDownload(response, title)
        })
        .catch(() => {
          this.$generalNotification('Failed to download file.', 'error')
        })
    }
  }
}
