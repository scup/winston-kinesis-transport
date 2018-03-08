const { Kinesis } = require('aws-sdk')
const Promisify = require('./Promisify')

const dependencies = { Kinesis, Promisify }

const KinesisClient = {
  putRecord ({ data, partitionKey, streamName, configuration }, injection) {
    return getKinesisInstance({ configuration }, injection).putRecord({
      Data: data,
      PartitionKey: partitionKey,
      StreamName: streamName
    })
  }
}

function getKinesisInstance ({ configuration }, injection) {
  const { Kinesis, Promisify } = Object.assign({}, dependencies, injection)

  if (!KinesisClient.kinesisInstance) {
    KinesisClient.kinesisInstance = new Promisify({
      ClassToBuild: Kinesis,
      methodsToPromisify: ['putRecord'],
      constructorParameters: configuration
    })
  }

  return KinesisClient.kinesisInstance
}

module.exports = KinesisClient
