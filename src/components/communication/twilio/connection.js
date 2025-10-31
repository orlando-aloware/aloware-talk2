import * as Events from '../../../constants/webrtc-events'

export default class TwilioConnection {
  constructor (device, connection, initEvents = false) {
    this._device = device
    this._connection = connection
    this.callSid = connection.parameters.CallSid
    this.from = (connection.parameters.From) ? connection.parameters.From : null
    this.to = (connection.parameters.To) ? connection.parameters.To : null
    this.state = connection.status()
    this.isMuted = connection.isMuted()
    this._callbacks = {
      'accept': [],
      'cancel': [],
      'disconnect': [],
      'error': [],
      'mute': [],
      'reconnecting': [],
      'reconnected': [],
      'reject': [],
      'ringing': [],
      'sample': [],
      'volume': [],
      'warning': [],
      'warning-cleared': []
    }

    // only init events if we need it
    if (initEvents) {
      this._initEvents()
    }
  }

  _executeCallback (cbName, args = []) {
    if (!this._callbacks[cbName]) {
      this._callbacks[cbName] = []
    }

    this._callbacks[cbName].forEach(cb => {
      cb.apply(null, args)
    })
  }

  on (event, handler) {
    this._callbacks[event].push(handler)
  }

  _initEvents () {
    this._connection.on(Events.CONNECTION_ACCEPT, (connection) => {
      this._executeCallback(Events.CONNECTION_ACCEPT, [connection])
    })
    this._connection.on(Events.CONNECTION_CANCEL, () => {
      this._executeCallback(Events.CONNECTION_CANCEL)
    })
    this._connection.on(Events.CONNECTION_DISCONNECT, (connection) => {
      this._executeCallback(Events.CONNECTION_DISCONNECT, [connection])
    })
    this._connection.on(Events.CONNECTION_ERROR, (error) => {
      this._executeCallback(Events.CONNECTION_ERROR, [error])
    })
    this._connection.on(Events.CONNECTION_MUTE, (isMute, connection) => {
      this._executeCallback(Events.CONNECTION_MUTE, [isMute, connection])
    })
    this._connection.on(Events.CONNECTION_RECONNECTING, (error) => {
      this._executeCallback(Events.CONNECTION_RECONNECTING, [error])
    })
    this._connection.on(Events.CONNECTION_RECONNECTED, () => {
      this._executeCallback(Events.CONNECTION_RECONNECTED)
    })
    this._connection.on(Events.CONNECTION_REJECT, () => {
      this._executeCallback(Events.CONNECTION_REJECT)
    })
    this._connection.on(Events.CONNECTION_RINGING, (hasEarlyMedia) => {
      this._executeCallback(Events.CONNECTION_RINGING, [hasEarlyMedia])
    })
    this._connection.on(Events.CONNECTION_SAMPLE, (rtcSample) => {
      this._executeCallback(Events.CONNECTION_SAMPLE, [rtcSample])
    })
    this._connection.on(Events.CONNECTION_VOLUME, (inputVolume, outputVolume) => {
      this._executeCallback(Events.CONNECTION_VOLUME, [inputVolume, outputVolume])
    })
    this._connection.on(Events.CONNECTION_WARNING, (warningName, warningData) => {
      this._executeCallback(Events.CONNECTION_WARNING, [warningName, warningData])
    })
    this._connection.on(Events.CONNECTION_WARNING_CLEARED, (warningName) => {
      this._executeCallback(Events.CONNECTION_WARNING_CLEARED, [warningName])
    })
    console.log('init connection events')
  }

  isMuted () {
    return this._connection.isMuted()
  }

  status () {
    return this._connection.status()
  }

  accept () {
    this._connection.accept()
  }

  hangup () {
    this._connection.disconnect()
  }

  reject () {
    this._connection.reject()
  }

  sendDigits (digit) {
    this._connection.sendDigits(digit)
  }

  mute (mute) {
    this._connection.mute(mute)
  }
}
