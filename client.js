'use strict'

let Socket = require('net').Socket

module.exports = class BouyomiCient {

  constructor (port, host) {
    this._port = port || 50001
    this._host = host || 'localhost'
  }

  command (id, payload) {
    return new Promise((resolve, reject) => {
      payload = payload || new Buffer(0)
      var buffer = new Buffer(2 + payload.length)
      buffer.writeInt16LE(id, 0)
      payload.copy(buffer, 2)
      let socket = new Socket()
      var error
      socket.on('error', (err) => { error = err })
      socket.on('close', (hadError) => {
        if (hadError) {
          return reject(error || new Error('unknown error'))
        }
        return resolve()
      })
      socket.on('connect', () => {
        socket.end(buffer)
      })
      socket.connect(this._port, this._host)
    })
  }

  talk (text, options) {
    options = options || {}
    let speed = options.speed !== undefined ? options.speed : -1
    let tone = options.tone !== undefined ? options.tone : -1
    let volume = options.volume !== undefined ? options.volume : -1
    let voice = options.voice || 0
    let code = options.code || 0
    let encoding = 'utf-8'
    if (code === 1) {
      encoding = 'Unicode'
    } else if (code === 2) {
      encoding = 'Shift-JIS'
    }
    let textBuffer = new Buffer(text, encoding)
    let buffer = new Buffer(13 + textBuffer.length)
    buffer.writeInt16LE(speed, 0)
    buffer.writeInt16LE(tone, 2)
    buffer.writeInt16LE(volume, 4)
    buffer.writeInt16LE(voice, 6)
    buffer.writeInt8(code, 8)
    buffer.writeInt32LE(textBuffer.length, 9)
    textBuffer.copy(buffer, 13)
    return this.command(0x01, buffer)
  }

  pause () {
    return this.command(0x10)
  }

  resume () {
    return this.command(0x20)
  }

  skip () {
    return this.command(0x30)
  }

  clear () {
    return this.command(0x40)
  }

}