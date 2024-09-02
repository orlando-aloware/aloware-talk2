import * as Carriers from '../../../constants/carriers'
import MainDevice from './../device'
import { get, first } from 'lodash'

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

  disconnectAll () {
    this._device.disconnectAll()
  }

  activeConnection () {
    const calls = get(this._device, '_calls', [])
    const hasCalls = calls instanceof Array ? calls.length > 0 : false

    if (!this._device || !hasCalls) {
      return null
    }

    // prevent connection events from re-initialization
    const initEvents = !this._device.isEventsStarted
    return this._createConnection(first(calls), initEvents)
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
    // prevent connection events from re-initialization
    if (initEvents && !this._device.isEventsStarted) {
      this._device.isEventsStarted = initEvents
    }

    return this._createConnection(await this._device.connect({ params }), initEvents)
  }

  destroy () {
    console.log('TEL-527 device.js destroy')
    this._device.disconnectAll()
    this._device.destroy()
    this._device._is_initialized = false
    this._device = null
  }
}
