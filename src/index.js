import aws from 'aws-sdk';
import Timer from 'timer2';
import EventEmitter from 'events';

const required = () => { throw new Error('You are missing required parameters in this function'); };

export default class SQSEvents {

  /**
   * Creates an instance of SQSEvents.
   * @param {string} queueUrl
   * * @param {string} region
   * @param {any} [accessKeyId=null]
   * @param {any} [secretAccessKey=null]
   * @memberOf SQSEvents
   */
  constructor({ queueUrl = required(), region = required(), shouldDeleteMessages = required() }, accessKeyId = null, secretAccessKey = null) {
    this.queueUrl = queueUrl;
    this.emitter = new EventEmitter();

    if (accessKeyId && secretAccessKey) {
      this.client = new aws.SQS({ credentials: { accessKeyId, secretAccessKey }, region });
      return this;
    }

    this.client = new aws.SQS({ region });
    return this;
  }

  /**
   * Returns the SQS client for your lower level request needs
   * @returns {AWS.SQS}
   * @memberOf SQSEvents
   */
  getClient() {
    return this.client;
  }

  on(eventName = required(), callback = required()) {
    this.emitter.on(eventName, callback);
    return this;
  }

  /**
   * Starts the polling process with a set interval in milliseconds
   * @param {number} [interval=5000]
   * @memberOf SQSEvents
   */
  poll(interval = 5000) {
    if (this.timeBetweenPolls) {
      this.timeBetweenPolls = null;
    }

    this.timeBetweenPolls = interval;
    this.timer = new Timer(interval, { immediate: true });
    this.timer.on('tick', this.pushEvent.bind(this));

    return this;
  }

  stop() {
    this.timer.stop();
    return this;
  }

  pushEvent() {
    console.log('triggered');
    
    this.client.receiveMessage({ QueueUrl: this.queueUrl })
      .promise()
      .then((res) => {
        console.log('got a msg', res);
        
        if (!res.data) {
          return;
        }

        console.log('meee', res.data);

        this.emitter.emit('message', res.data);
      })
      .catch((err) => { this.emitter.emit('error', err); });
  }
}
