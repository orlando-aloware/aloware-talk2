import * as Carriers from '../../constants/carriers'
import * as Events from '../../constants/webrtc-events'
import DeviceError from './twilio/error'
import TwilioConnection from './twilio/connection'
const TwilioClientDevice = require('@twilio/voice-sdk').Device

export default class Device {
  constructor (carrier) {
    this.carrier = carrier
    this._callbacks = {
      ready: [],
      offline: [],
      incoming: [],
      error: [],
      disconnect: [],
      connect: [],
      cancel: []
    }
    this._device = null
    this._is_initialized = false
  }

  _executeCallback (cbName, args = []) {
    if (!this._callbacks[cbName]) {
      this._callbacks[cbName] = []
    }

    this._callbacks[cbName].forEach(cb => {
      cb.apply(null, args)
    })
  }

  _createConnection (connection, initEvents = false) {
    if (!connection) {
      return undefined
    }
    return new TwilioConnection(this, connection, initEvents)
  }

  on (event, handler) {
    this._callbacks[event].push(handler)
  }

  initialize () {
    if (this._is_initialized) {
      return
    }
    this._device = this.carrier === Carriers.TWILIO ? new TwilioClientDevice() : null
    this._is_initialized = true
    this._initEvents()
  }

  _initEvents () {
    this._device.on(Events.READY, (device) => {
      this._executeCallback(Events.READY, [device])
    })
    this._device.on(Events.OFFLINE, (device) => {
      this._executeCallback(Events.OFFLINE, [device])
    })
    this._device.on(Events.INCOMING, (connection) => {
      this._executeCallback(Events.INCOMING, [this._createConnection(connection)])
    })
    this._device.on(Events.ERROR, (error) => {
      this._executeCallback(Events.ERROR, [new DeviceError(error)])
    })
    this._device.on(Events.DISCONNECT, (connection) => {
      this._executeCallback(Events.DISCONNECT, [this._createConnection(connection)])
    })
    this._device.on(Events.CONNECT, (connection) => {
      this._executeCallback(Events.CONNECT, [this._createConnection(connection)])
    })
    this._device.on(Events.CANCEL, (connection) => {
      this._executeCallback(Events.CANCEL, [this._createConnection(connection)])
    })
  }
}
