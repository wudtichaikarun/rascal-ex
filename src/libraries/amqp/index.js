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

function buildConfigSimpleQueue(config: IAmqpConnectionOptions) {
  return {
    vhosts: {
      config: {
        connections: mappingAmqpConfigConnection(config),
        exchanges: [''],
        queues: ['simple_queue'],
        publications: {
          simple_queue: {
            exchange: '',
          },
        },
        subscriptions: {
          simple_queue: {
            queue: 'simple_queue',
          },
        },
      },
    },
  }
}

export async function createAmqpConnection(options: IAmqpConnectionOptions) {
  const brokerConfig = buildConfigSimpleQueue(options)

  const broker = await Broker.create(brokerConfig)
  broker.on('error', (error) => {
    console.error(error)
  })

  console.log('INIT_BROKER_SUCCESS')

  // ********* 1. Simple queue ************
  // producer
  setInterval(async () => {
    const publication = await broker.publish('simple_queue', 'Hello World!', {
      routingKey: 'simple_queue',
    })
    publication.on('error', console.error)
  }, 1000)

  // consumer
  const subscription = await broker.subscribe('simple_queue')
  subscription
    .on('message', (message, content, ackOrNack) => {
      console.log(content)
      ackOrNack()
    })
    .on('error', console.error)
}
