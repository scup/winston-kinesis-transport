class AsyncMethodExecution {
  constructor (instance, methodName, parameters) {
    this.methodName = methodName
    this.instance = instance
    this.parameters = parameters

    this.callbackHandler = this.callbackHandler.bind(this)
    this.handler = this.handler.bind(this)
    this.execute = this.execute.bind(this)
  }

  handler (resolve, reject) {
    this.resolve = resolve
    this.reject = reject

    const method = this.instance[this.methodName]
    method.apply(this.instance, this.parameters.concat(this.callbackHandler))
  }

  callbackHandler (error, ...data) {
    if (error) return this.reject(error)
    this.resolve.apply(null, data)
  }

  execute () {
    return new Promise(this.handler)
  }
}

class PromisifyMethod {
  constructor (instance, methodName) {
    this.methodName = methodName
    this.instance = instance

    this.execute = this.execute.bind(this)
  }

  execute (...parameters) {
    return new AsyncMethodExecution(this.instance, this.methodName, parameters).execute()
  }
}

class Promisify {
  constructor ({ ClassToBuild, methodsToPromisify, constructorParameters }) {
    this.instance = new ClassToBuild(constructorParameters)

    this.excludePromisifyMethods = this.excludePromisifyMethods.bind(this)

    methodsToPromisify.forEach(this.promisifyMethod.bind(this))
    this.keepOtherMethods(methodsToPromisify)
  }

  excludePromisifyMethods (methods, methodName) {
    if (this.methodsToPromisify.includes(methodName)) {
      return methods
    }

    return Object.assign(methods, { [methodName]: this.instance[methodName] })
  }

  keepOtherMethods (methodsToPromisify) {
    this.methodsToPromisify = methodsToPromisify
    const methodsToKeep = Object.keys(this.instance).reduce(this.excludePromisifyMethods, {})
    Object.assign(this, methodsToKeep)
  }

  promisifyMethod (methodName) {
    const { instance } = this
    this[methodName] = Promisify.callbackAsPromise(instance, methodName)
  }
}

Promisify.callbackAsPromise = function callbackAsPromise (instance, methodName) {
  return new PromisifyMethod(instance, methodName).execute
}

Promisify.executeCallbackAsPromise = function executeCallbackAsPromise (instance, methodName, parameters) {
  return Promisify.callbackAsPromise(instance, methodName).apply(null, parameters)
}

module.exports = Promisify
