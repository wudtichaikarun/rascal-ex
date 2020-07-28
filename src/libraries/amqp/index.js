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
        queues: ['rpc_queue', 'rpc_queue_reply'],
        exchanges: [''],
        publications: {
          rpc_queue: {
            exchange: '',
          },
          rpc_queue_reply: {
            exchange: '',
          },
        },
        subscriptions: {
          rpc_queue: {
            queue: 'rpc_queue',
          },
          rpc_queue_reply: {
            queue: 'rpc_queue_reply',
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

  // ********* Client **********
  const correlationId = `${+new Date()}`
  const n = 6
  const publication = await broker.publish('rpc_queue', n, {
    routingKey: 'rpc_queue',
    options: {
      replyTo: 'rpc_queue_reply',
      correlationId,
    },
  })
  console.log(`Client request What is the result of Fibonacci(${n})....`)
  publication.on('error', console.error)

  const clientSubscriptions = await broker.subscribe('rpc_queue_reply')
  clientSubscriptions
    .on('message', (message, content, ackOrNack) => {
      const { properties } = message
      if (properties.correlationId === correlationId) {
        console.log(`Client response Fibonacci(${n})=${content}`)
      }
      ackOrNack()
    })
    .on('error', console.error)

  //  ********* Server **********
  const worker = await broker.subscribe('rpc_queue')
  worker
    .on('message', async (message, n, ackOrNack) => {
      // process
      console.log('Server process....')
      const { correlationId, replyTo } = message.properties
      const fibonacciValue = fibonacci(n)

      await broker.publish(replyTo, fibonacciValue, {
        routingKey: replyTo,
        options: {
          correlationId,
        },
      })
      console.log('Server reply')

      ackOrNack()
    })
    .on('error', console.error)
}

function fibonacci(n) {
  let _fibonacci = function (n) {
    if (n <= 2) return 1
    if (n in _fibonacci.cacheFib) {
      return _fibonacci.cacheFib[n]
    }
    const value = _fibonacci(n - 2) + _fibonacci(n - 1)
    _fibonacci.cacheFib[n] = value
    return value
  }
  _fibonacci.cacheFib = {}
  return _fibonacci(n)
}
