describe ('KinesisClient', function () {
  const { mock, assert } = require('sinon')
  const { expect } = require('chai')

  beforeEach(function () {
    delete require.cache[require.resolve('./KinesisClient')]

    this.KinesisClient = require('./KinesisClient')
    this.parameters = {
      data: 'the data',
      partitionKey: 'the partitionKey',
      streamName: 'the streamName',
      configuration: { anyConfiguration: 'anyValue' }
    }

    this.dependencies = {
      Kinesis: null,
      Promisify: mock()
    }

    const kinesisPromisified = {
      putRecord: mock()
        .thrice()
        .withExactArgs({
          Data: this.parameters.data,
          PartitionKey: this.parameters.partitionKey,
          StreamName: this.parameters.streamName
        })
        .resolves('the result')
    }

    this.dependencies.Promisify
      .withExactArgs({
        ClassToBuild: this.dependencies.Kinesis,
        methodsToPromisify: ['sendRecordToKinesis'],
        constructorParameters: this.parameters.configuration
      })
      .returns(kinesisPromisified)
  })

  it('returns putRecord call value', async function () {
    const result = await this.KinesisClient.sendRecordToKinesis(this.parameters, this.dependencies)

    expect(result).to.equal('the result')
  })

  it('instantiate Promisify just once for more calls', async function () {
    await this.KinesisClient.sendRecordToKinesis(this.parameters, this.dependencies)
    await this.KinesisClient.sendRecordToKinesis(this.parameters, this.dependencies)

    assert.calledOnce(this.dependencies.Promisify)
  })
})
