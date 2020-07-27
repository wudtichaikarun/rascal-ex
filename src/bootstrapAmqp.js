// @flow
import { config } from './bootstrapConfig'
import { createAmqpConnection } from './libraries/amqp/index'

async function bootstrapAmqp() {
  try {
    const options = {
      connectionUrl: config.amqp.AMQP_URI,
      username: config.amqp.AMQP_USERNAME,
      password: config.amqp.AMQP_PASSWORD,
    }

    await createAmqpConnection(options)
  } catch (error) {
    console.error(error)
    process.exit(-1)
  }
}

bootstrapAmqp()
