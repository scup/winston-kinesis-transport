const { Transport } = require('winston')
const { putRecord } = require('./AWS/KinesisClient')
const { log } = require('winston/lib/winston/common')

const dependencies = {
  log,
  random: Math.random,
  putRecord
}

const LOGGED = 'logged'

class WinstonKinesisTransport extends Transport {
  constructor ({ options }, injection) {
    super(options)
    const { log, random, putRecord } = Object.assign({}, dependencies, injection)
    this.injection = { log, random, putRecord }
    this.options = options
  }

  onSuccess (data, callback) {
    this.emit(LOGGED)
    callback(null, data)
  }

  async log (level, message, meta, callback) {
    const { transformer } = this.options

    const options = Object.assign({
      showLevel: true,
      timestamp: true,

      level,
      message,
      meta: transformer(meta)
    }, this.options)
    const output = this.injection.log(options)

    const kinesisObject = {
      data: output,
      partitionKey: `${this.injection.random()}`,
      streamName: this.options.streamName,
      configuration: this.options.configuration
    }

    try {
      const data = await this.injection.putRecord(kinesisObject)
      this.onSuccess(data, callback)
    } catch (error) {
      callback(error)
    }
  }
}

WinstonKinesisTransport.prototype.name = 'Kinesis'

module.exports = WinstonKinesisTransport
