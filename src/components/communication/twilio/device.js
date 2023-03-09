import * as Carriers from '../../../constants/carriers'
import MainDevice from './../device'

export default class TwilioDevice extends MainDevice {
  constructor () {
    super(Carriers.TWILIO)
  }

  setup (token, options = {}) {
    this._device.setup(token, options)
  }

  status () {
    if (!this._device) {
      return null
    }
    return this._device.status()
  }

  disconnectAll (connection) {
    this._device.disconnectAll(connection._connection)
  }

  activeConnection () {
    if (!this._device || !this._device._activeCall) {
      return null
    }
    return this._createConnection(this._device._activeCall)
  }

  availableInputDevices () {
    if (!this._device || !this._device.audio) {
      return []
    }
    return this._device.audio.availableInputDevices
  }

  setInputDevice (inputDevice) {
    if (!this._device || !this._device.audio) {
      return Promise.reject('Device is not yet initialized.')
    }
    return this._device.audio.setInputDevice(inputDevice)
  }

  updateToken (token) {
    return this._device.updateToken(token)
  }

  availableOutputDevices () {
    if (!this._device || !this._device.audio) {
      return []
    }
    return this._device.audio.availableOutputDevices
  }

  getSpeakerDevices () {
    if (!this._device || !this._device.audio) {
      return []
    }
    return this._device.audio.speakerDevices.get()
  }

  setSpeakerDevice (outputDevice) {
    if (!this._device || !this._device.audio) {
      return Promise.reject('Device is not yet initialized.')
    }
    return this._device.audio.speakerDevices.set(outputDevice)
  }

  testSpeakerDevice () {
    if (!this._device || !this._device.audio) {
      return Promise.reject('Device is not yet initialized.')
    }
    return this._device.audio.speakerDevices.test()
  }

  async connect (params, initEvents = false) {
    return this._createConnection(await this._device.connect({ params }), initEvents)
  }

  destroy () {
    this._device.destroy()
    this._device._is_initialized = false
  }
}
