import _ from 'lodash'

export default class DeviceError {
  constructor (error) {
    this._error = error
    this.code = error.code
    this.message = error.message
  }

  tokenError () {
    return _.includes([31204, 31205, 31207], this._error.code)
  }
}
