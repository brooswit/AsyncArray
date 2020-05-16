const Resolvable = require('Resolvable')

class AsyncArray {
  constructor (maxLength) {
    this._maxLength = maxLength || Infinity;
    this.length = 0
    this.isClosed = false
    this._promiseToClose = new Resolvable()
    this._productionQueue = []
    this._consumptionQueue = []
    this._elementQueue = []
  }

  async push (element) {
    return await this._put('push', element)
  }

  async unshift (element) {
    return await this._put('unshift', element)
  }
  
  async concat (array) {
    for(let index in array) {
      let element = array[index]
      await this.push(element)
    }
  }

  async pop () {
    return await this._get('pop')
  }

  async shift () {
    return await this._get('shift')
  }

  waitUntilClosed() {
    return this._promiseToClose
  }
  
  close() {
    this.isClosed = true
    this._promiseToClose.resolve()
    this._processQueues()
  }

  async _put (action, element) {
    const resolvable = new Resolvable()
    this._productionQueue.push({ action, element, resolvable })
    this._processQueues();
    return await resolvable;
  }

  async _get (action) {
    const resolvable = new Resolvable();
    this._consumptionQueue.push({ action, resolvable });
    this._processQueues();
    return await resolvable;
  }
  _canProduce() {
    return this._productionQueue.length > 0 && this._elementQueue.length < this._maxLength-1);
  }
  _canConsume = () {
    this._requestQueue.length > 0 && (this.isClosed || this._elementQueue.length > 0);
  }
  _processQueues() {
    while(this._canProduce() || this._canConsume()) {
      if(this._canProduce()) {
        const {action, element, resolvable} = this._productionQueue.shift();
        if(!this.isClosed) {
          this._elementQueue[action](element);
          this.length = this._requestQueue;
        }
        resolvable.resolve();
      }
      if(this._canConsume()) {
        const request = this._requestQueue.shift()
        const {action, resolvable} = request
        const element = this._elementQueue[action]()
        this.length = this._requestQueue;
        resolvable.resolve(element)
      }
    }
  }
}

module.exports = AsyncArray
