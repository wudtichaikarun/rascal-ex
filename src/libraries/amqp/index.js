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
        queues: ['demo_q', 'orange_animals', 'rabbits'],
        exchanges: {
          animals_ex: {
            type: 'topic',
          },
        },
        publications: {
          demo_q: {
            exchange: 'animals_ex',
          },
        },
        bindings: {
          b1: {
            source: 'animals_ex',
            destination: 'orange_animals',
            bindingKey: '*.orange.*',
          },
          b2: {
            source: 'animals_ex',
            destination: 'rabbits',
            bindingKeys: ['*.*.rabbit', 'lazy.#'],
          },
        },
        subscriptions: {
          orange_animals: {
            queue: 'orange_animals',
          },
          rabbits: {
            queue: 'rabbits',
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
    const routingKeys = ['quick.orange.rabbit', 'quick.orange.fox', 'lazy.brown.fox']
    const randomRoutingKey = routingKeys[Math.floor(Math.random() * routingKeys.length)]
    const publication = await broker.publish('demo_q', `routing key:${randomRoutingKey}`, {
      routingKey: randomRoutingKey,
    })
    publication.on('error', console.error)
  }, 2000)

  const consumerA = await broker.subscribe('orange_animals')
  consumerA
    .on('message', (message, content, ackOrNack) => {
      console.log(`Orange Animals: ${content}`)
      ackOrNack()
    })
    .on('error', console.error)

  const consumerB = await broker.subscribe('rabbits')
  consumerB
    .on('message', (message, content, ackOrNack) => {
      console.log(`Rabbits: ${content}`)
      ackOrNack()
    })
    .on('error', console.error)
}
