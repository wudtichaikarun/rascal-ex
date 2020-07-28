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
        queues: ['demo_q', 'print_log', 'save_log'],
        exchanges: {
          direct_logs: {
            type: 'direct',
          },
        },
        publications: {
          demo_q: {
            exchange: 'direct_logs',
          },
        },
        bindings: {
          b1: {
            source: 'direct_logs',
            destination: 'print_log',
            bindingKeys: ['info', 'warning', 'error'],
          },
          b2: {
            source: 'direct_logs',
            destination: 'save_log',
            bindingKey: 'error',
          },
        },
        subscriptions: {
          print_log: {
            queue: 'print_log',
          },
          save_log: {
            queue: 'save_log',
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
    const logLevels = ['info', 'warning', 'error']
    const randomLogLevel = logLevels[Math.floor(Math.random() * logLevels.length)]
    const publication = await broker.publish('demo_q', `Log Level:${randomLogLevel}`, {
      routingKey: randomLogLevel,
    })
    publication.on('error', console.error)
  }, 2000)

  const consumerA = await broker.subscribe('print_log')
  consumerA
    .on('message', (message, content, ackOrNack) => {
      console.log(`consumer A print log: ${content}`)
      ackOrNack()
    })
    .on('error', console.error)

  const consumerB = await broker.subscribe('save_log')
  consumerB
    .on('message', (message, content, ackOrNack) => {
      console.log(`consumer B save log: ${content}`)
      ackOrNack()
    })
    .on('error', console.error)
}
