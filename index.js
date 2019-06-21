const Resolvable = require('Resolvable')

class AsyncArray {
  constructor () {
    this.isClosed = false
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
    for(index in array) {
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

  close() {
    this.isClosed = true
  }

  _put (action, element) {
    if(this.isClosed) return null
    this._elementQueue[action](element)
    this._processQueues()
    return element
  }

  async _get (action) {
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
