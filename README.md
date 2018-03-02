# Winston Kinesis Transport - Encapsulating a configuration to create a transport with AWS Kinesis service associated
### Installing
    Add to your package.json dependencies 

```javascript
"winston-kinesis-transport": "git+ssh://git@github.com:scup/winston-kinesis-transport#master"
```
    $ yarn

### Configuration

#### 
```javascript

const options = {
    streamName: 'Stream name configured on AWS Kinesis',
    configuration: { //Configuration for AWS Service
        region: 'AWS Region',
        correctClockSkew: 'true or false, used here to activate or deactivate',
        accessKeyId: 'AWS Kinesis Access Id',
        secretAccessKey: 'AWS Kinesis secret'
    }
}

const winstonKinesisTransport = new WinstonKinesisTransport({options})
```
