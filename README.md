# Example

```
import Events from './index';

const e = new Events({
  queueUrl: 'Your queue URL', 
  region: 'us-east-1',
  shouldDeleteMessages: true,
});

e.poll(500)
 .on('message', (msg) => { console.log('I got an event!', msg); })
 .on('error', console.error);
```