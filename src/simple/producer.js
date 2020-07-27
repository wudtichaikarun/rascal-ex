import { broker } from '../libraries/amqp/index'
;(async () => {
  const publication = await broker.publish('demo_publication', 'Hello World!')
  publication.on('error', console.error)
})()
