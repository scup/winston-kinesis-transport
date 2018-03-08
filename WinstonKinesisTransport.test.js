describe('WinstonKinesisTransport', function () {
  const { mock } = require('sinon')

  const WinstonKinesisTransport = require('./WinstonKinesisTransport')

  context('when successful sendRecordToKinesis into Kinesis', function () {
    before(async function () {
      const level = 'level'
      const message = 'message'
      const meta = 'meta'
      const transformedMeta = 'transformedMeta'
      this.callback = mock()

      const options = {
        transformer: mock().withExactArgs(meta).returns(transformedMeta),
        streamName: 'any stream Name',
        configuration: { any: 'configuration' }
      }

      const kinesisData = { anyData: 'anyValue' }

      this.putRecordResult = 'any putRecordResult'

      const dependencies = {
        log: mock(),
        putRecord: mock().withExactArgs({
          data: kinesisData,
          partitionKey: 'random value',
          streamName: options.streamName,
          configuration: options.configuration
        }).resolves(this.putRecordResult),
        random: mock().returns('random value')
      }

      dependencies.log
        .withExactArgs({
          showLevel: true,
          timestamp: true,

          level,
          message,
          meta: transformedMeta,
          streamName: options.streamName,
          transformer: options.transformer,
          configuration: options.configuration
        })
        .returns(kinesisData)

      this.winstonKinesisTransport = new WinstonKinesisTransport({ options }, dependencies)

      this.instanceMock = mock(this.winstonKinesisTransport)
      this.instanceMock.expects('emit').withExactArgs('logged')

      await this.winstonKinesisTransport.log(level, message, meta, this.callback)
    })

    it('emits logged event to parent class', function () {
      this.instanceMock.verify()
    })
  })

  context('when an error happen during putRecord into Kinesis', function () {
    it('calls callback with error thrown', async function () {
      const error = new Error('put record error')
      const dependencies = {
        log: mock(),
        putRecord: mock().rejects(error),
        random: mock()
      }

      const options = {
        transformer: mock()
      }

      const callback = mock().withExactArgs(error)

      const winstonKinesisTransport = new WinstonKinesisTransport({ options }, dependencies)

      await winstonKinesisTransport.log(null, null, null, callback)

      callback.verify()
    })
  })
})
