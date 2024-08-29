import * as Carriers from '../../constants/carriers'
import * as Events from '../../constants/webrtc-events'
import DeviceError from './twilio/error'
import TwilioConnection from './twilio/connection'
const TwilioClientDevice = require('@twilio/voice-sdk').Device

export default class Device {
  constructor (carrier) {
    this.carrier = carrier
    this._callbacks = {
      registered: [],
      unregistered: [],
      incoming: [],
      error: [],
      disconnect: [],
      connect: [],
      cancel: [],
      tokenWillExpire: []
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

  initialize (token, options = {}) {
    if (this._is_initialized) {
      return
    }

    this._device = this.carrier === Carriers.TWILIO ? new TwilioClientDevice(token, options) : null
    this._device.isEventsStarted = false
    this._is_initialized = true

    // this._callbacks = {
    //   registered: [],
    //   unregistered: [],
    //   incoming: [],
    //   error: [],
    //   disconnect: [],
    //   connect: [],
    //   cancel: [],
    //   tokenWillExpire: []
    // } // for testing

    this._initEvents()
  }

  register () {
    if (this._device.state !== Events.UNREGISTERED) {
      return
    }

    this._device.register()
  }

  _initEvents () {
    this._device.on(Events.REGISTERED, (device) => {
      this._executeCallback(Events.REGISTERED, [this._device])
    })

    this._device.on(Events.UNREGISTERED, (device) => {
      this._executeCallback(Events.UNREGISTERED, [device])
    })

    this._device.on(Events.INCOMING, (connection) => {
      // this._executeCallback(Events.INCOMING, [this._createConnection(connection)])
      this._executeCallback(Events.INCOMING, [connection]) // TEL-527 for testing
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

    this._device.on(Events.TOKEN_WILL_EXPIRE, () => {
      this._executeCallback(Events.TOKEN_WILL_EXPIRE)
    })
  }
}
