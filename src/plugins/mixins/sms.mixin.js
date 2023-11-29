import * as SMS from 'src/constants/sms'

export default {
  data () {
    return {
      hasReplaceableBySmartEncoding: false,
      smartEncodingExtraChars: 0,
      smartEncodedMessageLength: 0,
      base: SMS.DEFAULT_BASE,
      segments: 0,
      limit: 0,
      hasUnicode: false
    }
  },

  methods: {
    messageLength (message) {
      this.hasUnicode = false
      this.smartEncodingExtraChars = 0

      // iterating over each character
      ;[...message].forEach((char) => {
        // if unicode number is over 127
        let charCode = char.charCodeAt(0)
        let isMoreThanAscii = charCode > 127
        if (isMoreThanAscii) {
          // change char to unicode
          // for example: e => 0064
          let unicode = char
            .codePointAt(0)
            .toString(16)
            .padStart(4, '0')

          let isReplaceableBySmartEncoding =
          SMS.SMART_ENCODING_CHARS.includes(unicode)

          // check if this UCS-2 character is replaceable with ASCII character
          if (!isReplaceableBySmartEncoding) {
            this.hasUnicode = true
          }

          // check if this UCS-2 character is replaceable with ASCII character with more than one character
          // for example => ½ will be replaced by 1/2 which is 3 characters and not 1
          let smartCharCount = SMS.SMART_ENCODING_CHAR_COUNT.find(
            (char) => char.key === unicode
          )

          if (smartCharCount) {
            this.smartEncodingExtraChars += smartCharCount.value - 1
          }
        }
      })

      this.smartEncodedMessageLength =
        message.length + this.smartEncodingExtraChars

      this.getMessageInfo(message)

      return this.smartEncodedMessageLength
    },

    getMessageInfo (message) {
      const messageLength = this.smartEncodedMessageLength

      // Return 0 if message is empty or length is 0
      if (!message || messageLength === 0) {
        this.base = SMS.DEFAULT_BASE
        this.segments = 0
        return 0
      }

      // Define characters per page based on the presence of Unicode
      const charactersPerPage = this.hasUnicode ? SMS.UNICODE_SMS_PAGES : SMS.UNICODE_SMS_PAGES

      // Determine segments and set the 'base' and 'limit' properties
      if (messageLength <= charactersPerPage[0]) {
        this.segments = 1
        this.limit = charactersPerPage[0]
        this.base = charactersPerPage[0]
      } else if (messageLength <= charactersPerPage[0] + charactersPerPage[1]) {
        this.segments = 2
        this.limit = charactersPerPage[0]
        this.base = charactersPerPage[1]
      } else if (messageLength <= charactersPerPage[0] + charactersPerPage[1] + charactersPerPage[2]) {
        this.segments = 3
        this.limit = charactersPerPage[0] + charactersPerPage[1]
        this.base = charactersPerPage[2]
      } else {
        this.segments = Math.ceil((messageLength - charactersPerPage[0] - charactersPerPage[1] - charactersPerPage[2]) / charactersPerPage[2]) + 3
        this.base = charactersPerPage[2]
        this.limit = charactersPerPage[2] * (this.segments - 3)
      }
    }
  }
}
