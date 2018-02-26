describe('Promisify', function () {
  const { expect } = require('chai')
  const { mock, match } = require('sinon')
  const { random } = require('faker')
  const Promisify = require('./Promisify')

  describe('#prototype.promisifyMethod -> transform callback method in promise', function () {
    before(function () {
      const constructorParameters = { fieldOne: '1', fieldTwo: 2 }

      const promisifyOne = mock()
      const promisifyTwo = mock()
      const dontPromisify = mock()

      this.instance = { promisifyOne, promisifyTwo, dontPromisify }

      const ClassToBuild = mock().withExactArgs(constructorParameters).returns(this.instance)
      const methodsToPromisify = ['promisifyOne', 'promisifyTwo']

      this.promisifyInstance = new Promisify({
        ClassToBuild,
        methodsToPromisify,
        constructorParameters
      })
    })

    it('overrides methods to promisify', function () {
      expect(this.promisifyInstance.promisifyOne).to.not.equal(this.instance.promisifyOne)
      expect(this.promisifyInstance.promisifyTwo).to.not.equal(this.instance.promisifyTwo)
    })

    it('keeps methods out of promisifyMethods', function () {
      expect(this.promisifyInstance.dontPromisify).to.equal(this.instance.dontPromisify)
    })

    it('resolves the promise when the callback has no errot', function () {
      const anyResult = random.number()

      this.instance.promisifyOne
        .on(this.instance)
        .withExactArgs(1, 'two', true, match.func)
        .yields(null, anyResult)

      const promise = this.promisifyInstance.promisifyOne(1, 'two', true)

      return expect(promise).to.eventually.equal(anyResult)
    })

    it('rejects the promise when the callback has an error', function () {
      const anyError = random.number()

      this.instance.promisifyTwo
        .on(this.instance)
        .withExactArgs(1, 'two', true, match.func)
        .yields(anyError)

      const promise = this.promisifyInstance.promisifyTwo(1, 'two', true)

      return expect(promise).to.eventually.rejectedWith(anyError)
    })
  })

  describe('#callbackAsPromise', function () {
    it('creates a function that make callbacks into promises', async function () {
      const anyResult = random.number()
      const method = mock()
      const instance = { any: Object, method }

      method
        .twice()
        .on(instance)
        .withExactArgs(1, 'two', true, match.func)
        .yields(null, anyResult)

      const callbackMethod = Promisify.callbackAsPromise(instance, 'method')

      expect(callbackMethod).to.be.an('function')

      const promise = callbackMethod(1, 'two', true)
      await expect(promise).to.eventually.equal(anyResult)

      const promise2 = callbackMethod(1, 'two', true)
      await expect(promise2).to.eventually.equal(anyResult)
    })
  })

  describe('#executeCallbackAsPromise', function () {
    it('executes a function that make callbacks into promises', function () {
      const anyResult = random.number()
      const method = mock()
      const instance = { any: Object, method }

      method
        .on(instance)
        .withExactArgs(1, 'two', true, match.func)
        .yields(null, anyResult)

      const promise = Promisify.executeCallbackAsPromise(instance, 'method', [1, 'two', true])

      return expect(promise).to.eventually.equal(anyResult)
    })
  })
})
