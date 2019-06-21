const Resolvable = require('Resolvable')

class AsyncArray {
  constructor () {
    this.length = 0
    this.isClosed = false
    this._promiseToClose = new Resolvable()
    this._requestQueue = []
    this._elementQueue = []
  }

  push (element) {
    return this._put('push', element)
  }

  unshift (element) {
    return this._put('unshift', element)
  }
  
  concat (array) {
    for(let index in array) {
      let element = array[index]
      this.push(element)
    }
  }

  async pop () {
    return await this._get('pop')
  }

  async shift () {
    return await this._get('shift')
  }
  
  async getAll () {
    await this.waitUntilClosed()
    const result = this._elementQueue
    this._elementQueue = []
    return result
  }

  waitUntilClosed() {
    return this._promiseToClose
  }
  
  close() {
    this.isClosed = true
    this._promiseToClose.resolve()
  }

  _put (action, element) {
    this.length ++
    if(this.isClosed) return null
    this._elementQueue[action](element)
    this._processQueues()
    return element
  }

  async _get (action) {
    this.length --
    const resolvable = new Resolvable()
    this._requestQueue.push({ action, resolvable })
    this._processQueues()
    return await resolvable
  }

  _processQueues() {
    while(this._requestQueue.length > 0 && (this.isClosed || this._elementQueue.length > 0) ) {
      const {action, resolvable} = this._requestQueue.shift()
      const element = this._elementQueue[action]()
      resolvable.resolve(element)
    }
  }
}

module.exports = AsyncArray
