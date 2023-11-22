import { SMART_ENCODING_CHARS, SMART_ENCODING_CHAR_COUNT } from 'src/constants/sms'

export default {
  data () {
    return {
      hasReplaceableBySmartEncoding: false,
      smartEncodingExtraChars: 0,
      smartEncodedMessageLength: 0,
      base: 160,
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
            .toUpperCase()
          let isReplaceableBySmartEncoding =
            SMART_ENCODING_CHARS.includes(unicode)
          // check if this UCS-2 character is replaceable with ASCII character
          if (!isReplaceableBySmartEncoding) {
            this.hasUnicode = true
          }
          // check if this UCS-2 character is replaceable with ASCII character with more than one character
          // for example => ½ will be replaced by 1/2 which is 3 characters and not 1
          let smartCharCount = SMART_ENCODING_CHAR_COUNT.find(
            (char) => char.key === unicode
          )

          if (smartCharCount) {
            this.smartEncodingExtraChars += smartCharCount.value - 1
          }
        }
      })
      this.smartEncodedMessageLength =
        message.length + this.smartEncodingExtraChars
      return this.smartEncodedMessageLength
    }
  }
}
