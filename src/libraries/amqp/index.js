// @flow
import { BrokerAsPromised as Broker } from 'rascal'

export interface IAmqpConnectionOptions {
  connectionUrl: string;
  username: string;
  password: string;
  prefix?: string;
  defaultSubscription?: any;
}

function mappingAmqpConfigConnection(config: IAmqpConnectionOptions) {
  const { connectionUrl, username, password } = config
  return connectionUrl.split(',').map((uri: string) => ({
    url: uri.replace(`://`, `://${username}:${password}@`),
  }))
}

function buildConfig(config: IAmqpConnectionOptions) {
  return {
    vhosts: {
      config: {
        connections: mappingAmqpConfigConnection(config),
        queues: ['demo_q', 'consumer_a', 'consumer_b'],
        exchanges: {
          demo_pub_sub_ex: {
            type: 'fanout',
          },
        },
        publications: {
          demo_q: {
            exchange: 'demo_pub_sub_ex',
          },
        },
        bindings: {
          b1: {
            source: 'demo_pub_sub_ex',
            destination: 'consumer_a',
          },
          b2: {
            source: 'demo_pub_sub_ex',
            destination: 'consumer_b',
          },
        },
        subscriptions: {
          consumer_a: {
            queue: 'consumer_a',
          },
          consumer_b: {
            queue: 'consumer_b',
          },
        },
      },
    },
  }
}

export async function createAmqpConnection(options: IAmqpConnectionOptions) {
  const brokerConfig = buildConfig(options)

  const broker = await Broker.create(brokerConfig)
  broker.on('error', (error) => {
    console.error(error)
  })

  console.log('INIT_BROKER_SUCCESS')

  // producer
  setInterval(async () => {
    const publication = await broker.publish('demo_q', 'Hello World!')
    publication.on('error', console.error)
  }, 1000)

  const consumerA = await broker.subscribe('consumer_a')
  consumerA
    .on('message', (message, content, ackOrNack) => {
      console.log(`consumerA: ${content}`)

      ackOrNack()
    })
    .on('error', console.error)

  const consumerB = await broker.subscribe('consumer_b')
  consumerB
    .on('message', (message, content, ackOrNack) => {
      console.log(`consumerB: ${content}`)

      ackOrNack()
    })
    .on('error', console.error)
}
