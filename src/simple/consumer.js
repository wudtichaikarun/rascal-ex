import { broker } from '../libraries/amqp/index'
;(async () => {
  const subscription = await broker.subscribe('demo_subscription')
  subscription
    .on('message', (message, content, ackOrNack) => {
      console.log(content)
      ackOrNack()
    })
    .on('error', console.error)
})()
